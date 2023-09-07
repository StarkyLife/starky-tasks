import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { TaskSaveData, TaskItemShort, TaskContentUpdateData } from '#/core/data/task-item';

export type CanFindTasks = {
  findTasks: () => TE.TaskEither<Error, TaskItemShort[]>;
};

export type CanGetTaskById = {
  getTaskById: (taskId: string) => TE.TaskEither<Error, TaskItemShort>;
};

export type CanSaveTask = {
  saveTask: (taskData: TaskSaveData) => TE.TaskEither<Error, TaskItemShort>;
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
