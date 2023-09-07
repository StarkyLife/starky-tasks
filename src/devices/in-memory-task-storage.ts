import * as A from 'fp-ts/Array';
import { flow, constVoid, constant, pipe } from 'fp-ts/function';
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
    findTasks: () =>
      pipe(
        TE.Do,
        TE.map(() => Array.from(tasksMap.values())),
      ),
    getTaskById: flow(
      TE.of,
      TE.flatMap((id) => pipe(tasksMap.get(id), TE.fromNullable(new Error('Not found')))),
    ),
    saveTask: (taskData: TaskSaveData) =>
      pipe(
        TE.of(taskData.id),
        TE.map(
          flow(
            O.flatMap((id) => pipe(tasksMap.get(id), O.fromNullable)),
            O.getOrElse(
              constant<TaskItemShort>({
                id: taskData.title + '_id',
                title: '',
                isDone: false,
              }),
            ),
          ),
        ),
        TE.map((existing) => ({
          ...existing,
          title: pipe(taskData.title, O.getOrElse(constant(existing.title))),
          isDone: pipe(taskData.isDone, O.getOrElse(constant(existing.isDone))),
        })),
        TE.tap((item) => TE.of(tasksMap.set(item.id, item))),
      ),
    removeTask: (taskId) =>
      pipe(
        TE.Do,
        TE.map(() => tasksMap.delete(taskId)),
        TE.map(() => contentMap.delete(taskId)),
        TE.map(constVoid),
      ),
    getTaskContent: flow(
      TE.of,
      TE.map((id) => pipe(contentMap.get(id), O.fromNullable)),
    ),
    updateTaskContent: ({ id, content }) =>
      pipe(
        TE.Do,
        TE.map(() => contentMap.set(id, content)),
        TE.map(constVoid),
      ),
  };
};
