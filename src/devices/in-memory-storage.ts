import { constVoid, constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { TaskItem } from '#/core/data/task-item';
import {
  CanFindTasks,
  CanInsertTask,
  CanMarkTaskAsDone,
  CanRemoveTask,
  CanUpdateTask,
} from '#/dependencies';

export const createInMemoryStorage = (): CanFindTasks &
  CanInsertTask &
  CanRemoveTask &
  CanUpdateTask &
  CanMarkTaskAsDone => {
  const tasksMap = new Map<string, TaskItem>();

  return {
    findTasks: () => TE.of(Array.from(tasksMap.values())),
    insertTask: (taskData) =>
      pipe(
        TE.of({ id: taskData.title + '_id', isDone: false, notes: '', ...taskData }),
        TE.tap((item) => TE.of(tasksMap.set(item.id, item))),
      ),
    removeTask: (taskId) => pipe(TE.of(tasksMap.delete(taskId)), TE.map(constVoid)),
    updateTask: (taskUpdateItem) =>
      pipe(
        tasksMap.get(taskUpdateItem.id),
        TE.fromNullable(new Error('Not found')),
        TE.map((existing) => ({
          ...existing,
          title: pipe(taskUpdateItem.title, O.getOrElse(constant(existing.title))),
          notes: pipe(taskUpdateItem.notes, O.getOrElse(constant(existing.notes))),
        })),
        TE.tap((item) => TE.of(tasksMap.set(item.id, item))),
      ),
    markAsDone: (taskId) =>
      pipe(
        tasksMap.get(taskId),
        TE.fromNullable(new Error('Not found')),
        TE.map((existing) => ({ ...existing, isDone: true })),
        TE.tap((item) => TE.of(tasksMap.set(item.id, item))),
      ),
  };
};
