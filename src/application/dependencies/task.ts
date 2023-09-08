import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  TaskCreateData,
  TaskItemShort,
  TaskContentUpdateData,
  TaskUpdateData,
  TaskSearchCriteria,
} from '#/core/data/task-item';

export type CanFindTasks = {
  findTasks: (criteria: TaskSearchCriteria) => TE.TaskEither<Error, TaskItemShort[]>;
};

export type CanGetTaskById = {
  getTaskById: (taskId: string) => TE.TaskEither<Error, TaskItemShort>;
};

export type CanCreateTask = {
  createTask: (taskData: TaskCreateData) => TE.TaskEither<Error, TaskItemShort>;
};

export type CanUpdateTask = {
  updateTask: (taskData: TaskUpdateData) => TE.TaskEither<Error, TaskItemShort>;
};

export type CanRemoveTask = {
  removeTask: (taskId: string) => TE.TaskEither<Error, void>;
};

export type CanGetTaskContent = {
  getTaskContent: (taskId: string) => TE.TaskEither<Error, O.Option<string>>;
};

export type CanUpdateTaskContent = {
  updateTaskContent: (data: TaskContentUpdateData) => TE.TaskEither<Error, void>;
};
