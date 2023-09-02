import * as TE from 'fp-ts/TaskEither';
import {
  TaskCreationData,
  TaskItemDetails,
  TaskItemShort,
  TaskNotesUpdateData,
  TaskStateUpdateData,
  TaskUpdateData,
} from './core/data/task-item';

export type CanFindTasks = {
  findTasks: () => TE.TaskEither<Error, TaskItemShort[]>;
};

export type CanGetTaskById = {
  getTaskById: (taskId: string) => TE.TaskEither<Error, TaskItemDetails>;
};

export type CanInsertTask = {
  insertTask: (taskData: TaskCreationData) => TE.TaskEither<Error, TaskItemShort>;
};

export type CanRemoveTask = {
  removeTask: (taskId: string) => TE.TaskEither<Error, void>;
};

export type CanUpdateTask = {
  updateTask: (taskItem: TaskUpdateData) => TE.TaskEither<Error, TaskItemShort>;
};

export type CanUpdateTaskNotes = {
  updateTaskNotes: (data: TaskNotesUpdateData) => TE.TaskEither<Error, TaskItemDetails>;
};

export type CanSetTaskState = {
  setTaskState: (data: TaskStateUpdateData) => TE.TaskEither<Error, TaskItemShort>;
};
