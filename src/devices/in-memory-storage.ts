import { constVoid, constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  CanFindTasks,
  CanSaveTask,
  CanRemoveTask,
  CanUpdateTaskNotes,
  CanGetTaskById,
  CanGetTaskNotes,
} from '#/application/dependencies';
import { TaskItemShort, TaskSaveData } from '#/core/data/task-item';

type InMemoryStorage = CanFindTasks &
  CanGetTaskById &
  CanSaveTask &
  CanRemoveTask &
  CanGetTaskNotes &
  CanUpdateTaskNotes;

export const createInMemoryStorage = (): InMemoryStorage => {
  const tasksMap = new Map<string, TaskItemShort>();
  const notesMap = new Map<string, string>();

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
        TE.map(constant(notesMap.delete(taskId))),
        TE.map(constVoid),
      ),
    getTaskNotes: (taskId) => pipe(notesMap.get(taskId), O.fromNullable, TE.of),
    updateTaskNotes: ({ id, notes }) =>
      pipe(
        tasksMap.get(id),
        TE.fromNullable(new Error('Not found')),
        TE.tap(constant(TE.of(notesMap.set(id, notes)))),
        TE.map(constVoid),
      ),
  };
};
