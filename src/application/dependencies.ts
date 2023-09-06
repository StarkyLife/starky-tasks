import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { TaskSaveData, TaskItemShort, TaskNotesUpdateData } from '#/core/data/task-item';

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

export type CanGetTaskNotes = {
  getTaskNotes: (taskId: string) => TE.TaskEither<Error, O.Option<string>>;
};

export type CanUpdateTaskNotes = {
  updateTaskNotes: (data: TaskNotesUpdateData) => TE.TaskEither<Error, void>;
};
