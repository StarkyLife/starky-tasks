import * as TE from 'fp-ts/TaskEither';
import { TaskCreationData, TaskItem, TaskUpdateData } from './core/data/task-item';

export type CanFindTasks = {
  findTasks: () => TE.TaskEither<Error, TaskItem[]>;
};

export type CanInsertTask = {
  insertTask: (taskData: TaskCreationData) => TE.TaskEither<Error, TaskItem>;
};

export type CanRemoveTask = {
  removeTask: (taskId: string) => TE.TaskEither<Error, void>;
};

export type CanUpdateTask = {
  updateTask: (taskItem: TaskUpdateData) => TE.TaskEither<Error, TaskItem>;
};

export type CanMarkTaskAsDone = {
  markAsDone: (taskId: string) => TE.TaskEither<Error, TaskItem>;
};
