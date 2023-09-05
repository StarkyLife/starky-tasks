import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { TaskItemDetails } from './core/data/task-item';
import { CanGetTaskById, CanGetTaskNotes } from './dependencies';

export const getTaskDetailsUseCase =
  (deps: CanGetTaskById & CanGetTaskNotes) =>
  (taskId: string): TE.TaskEither<Error, TaskItemDetails> =>
    pipe(
      TE.Do,
      TE.bind('item', () => deps.getTaskById(taskId)),
      TE.bind('notes', () => deps.getTaskNotes(taskId)),
      TE.map(({ item, notes }): TaskItemDetails => ({ ...item, notes })),
    );
