import { constVoid, constant, pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { TaskItemDetails, TaskItemShort } from '#/core/data/task-item';
import {
  CanFindTasks,
  CanInsertTask,
  CanSetTaskState,
  CanRemoveTask,
  CanUpdateTask,
  CanUpdateTaskNotes,
  CanGetTaskById,
} from '#/dependencies';

type InMemoryStorage = CanFindTasks &
  CanGetTaskById &
  CanInsertTask &
  CanRemoveTask &
  CanUpdateTask &
  CanUpdateTaskNotes &
  CanSetTaskState;

export const createInMemoryStorage = (): InMemoryStorage => {
  const tasksMap = new Map<string, TaskItemShort>();
  const notesMap = new Map<string, string>();

  return {
    findTasks: () => TE.of(Array.from(tasksMap.values())),
    getTaskById: (id) =>
      pipe(
        TE.Do,
        TE.bind('item', constant(pipe(tasksMap.get(id), TE.fromNullable(new Error('Not found'))))),
        TE.bind('notes', constant(pipe(notesMap.get(id), TE.fromNullable(new Error('Not found'))))),
        TE.map(({ item, notes }): TaskItemDetails => ({ ...item, notes })),
      ),
    insertTask: (taskData) =>
      pipe(
        TE.of({ id: taskData.title + '_id', isDone: false, ...taskData }),
        TE.tap((item) => TE.of(tasksMap.set(item.id, item))),
        TE.tap((item) => TE.of(notesMap.set(item.id, ''))),
      ),
    removeTask: (taskId) =>
      pipe(
        TE.of(tasksMap.delete(taskId)),
        TE.map(constant(notesMap.delete(taskId))),
        TE.map(constVoid),
      ),
    updateTask: ({ id, title }) =>
      pipe(
        tasksMap.get(id),
        TE.fromNullable(new Error('Not found')),
        TE.map((existing) => ({ ...existing, title })),
        TE.tap((item) => TE.of(tasksMap.set(item.id, item))),
      ),
    updateTaskNotes: ({ id, notes }) =>
      pipe(
        tasksMap.get(id),
        TE.fromNullable(new Error('Not found')),
        TE.tap(constant(TE.of(notesMap.set(id, notes)))),
        TE.map((item): TaskItemDetails => ({ ...item, notes })),
      ),
    setTaskState: ({ id, isDone }) =>
      pipe(
        tasksMap.get(id),
        TE.fromNullable(new Error('Not found')),
        TE.map((existing) => ({ ...existing, isDone })),
        TE.tap((item) => TE.of(tasksMap.set(item.id, item))),
      ),
  };
};
