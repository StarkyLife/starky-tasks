import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  TaskTitleUpdateData,
  TaskItemDetails,
  TaskRelationUpdateData,
} from '#/core/data/task-item';
import {
  CanCreateTask,
  CanRemoveTask,
  CanUpdateTaskContent,
  CanUpdateTask,
  CanGetTaskById,
  CanGetTaskContent,
  CanFindTasks,
} from './dependencies';

/* Create */

export const addTaskUseCase = (deps: CanCreateTask) => deps.createTask;

/* Read */

export const getTasksUseCase = (deps: CanFindTasks) => deps.findTasks;

export const getTaskDetailsUseCase =
  (deps: CanGetTaskById & CanGetTaskContent & CanFindTasks) =>
  (taskId: string): TE.TaskEither<Error, TaskItemDetails> =>
    pipe(
      TE.Do,
      TE.bind('item', () => deps.getTaskById(taskId)),
      TE.bind('content', () => deps.getTaskContent(taskId)),
      TE.bind('tasks', () => deps.findTasks({ parentId: O.some(taskId) })),
      TE.map(({ item, content, tasks }): TaskItemDetails => ({ ...item, content, tasks })),
    );

/* Update */

export const editTaskContentUseCase = (deps: CanUpdateTaskContent) => deps.updateTaskContent;

export const editTaskUseCase =
  (deps: CanUpdateTask) =>
  ({ id, title }: TaskTitleUpdateData) =>
    deps.updateTask({ id, title: O.some(title), isDone: O.none, parentId: O.none });

export const moveTaskUseCase =
  (deps: CanUpdateTask) =>
  ({ id, parentId }: TaskRelationUpdateData) =>
    deps.updateTask({ id, title: O.none, isDone: O.none, parentId: O.some(parentId) });

export const finishTaskUseCase = (deps: CanUpdateTask) => (id: string) =>
  deps.updateTask({ id, title: O.none, isDone: O.some(true), parentId: O.none });

export const reopenTaskUseCase = (deps: CanUpdateTask) => (id: string) =>
  deps.updateTask({ id, title: O.none, isDone: O.some(false), parentId: O.none });

/* Delete */

export const deleteTaskUseCase = (deps: CanRemoveTask) => deps.removeTask;
