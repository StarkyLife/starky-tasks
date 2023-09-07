import * as A from 'fp-ts/Array';
import { constVoid, constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  CanFindTasks,
  CanSaveTask,
  CanRemoveTask,
  CanUpdateTaskContent,
  CanGetTaskById,
  CanGetTaskContent,
} from '#/application/dependencies';
import { TaskItemShort, TaskSaveData } from '#/core/data/task-item';

type InMemoryTaskStorage = CanFindTasks &
  CanGetTaskById &
  CanSaveTask &
  CanRemoveTask &
  CanGetTaskContent &
  CanUpdateTaskContent;

export const createInMemoryTaskStorage = (seed: O.Option<TaskItemShort[]>): InMemoryTaskStorage => {
  const tasksMap = pipe(
    seed,
    O.map(A.map((s): [string, TaskItemShort] => [s.id, s])),
    O.match(
      () => new Map<string, TaskItemShort>(),
      (s) => new Map<string, TaskItemShort>(s),
    ),
  );
  const contentMap = new Map<string, string>();

  return {
    findTasks: () => TE.of(Array.from(tasksMap.values())),
    getTaskById: (id) => pipe(tasksMap.get(id), TE.fromNullable(new Error('Not found'))),
    saveTask: (taskData: TaskSaveData) =>
      pipe(
        taskData.id,
        O.flatMap((id) => pipe(tasksMap.get(id), O.fromNullable)),
        O.getOrElse(
          constant<TaskItemShort>({
            id: taskData.title + '_id',
            title: '',
            isDone: false,
          }),
        ),
        (existing) =>
          TE.of<Error, TaskItemShort>({
            ...existing,
            title: pipe(taskData.title, O.getOrElse(constant(existing.title))),
            isDone: pipe(taskData.isDone, O.getOrElse(constant(existing.isDone))),
          }),
        TE.tap((item) => TE.of(tasksMap.set(item.id, item))),
      ),
    removeTask: (taskId) =>
      pipe(
        TE.of(tasksMap.delete(taskId)),
        TE.map(constant(contentMap.delete(taskId))),
        TE.map(constVoid),
      ),
    getTaskContent: (taskId) => pipe(contentMap.get(taskId), O.fromNullable, TE.of),
    updateTaskContent: ({ id, content }) =>
      pipe(
        tasksMap.get(id),
        TE.fromNullable(new Error('Not found')),
        TE.tap(constant(TE.of(contentMap.set(id, content)))),
        TE.map(constVoid),
      ),
  };
};
