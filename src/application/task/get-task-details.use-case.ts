import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { TaskItemDetails } from '#/core/data/task-item';
import { CanGetTaskById, CanGetTaskContent } from '../dependencies';

export const getTaskDetailsUseCase =
  (deps: CanGetTaskById & CanGetTaskContent) =>
  (taskId: string): TE.TaskEither<Error, TaskItemDetails> =>
    pipe(
      TE.Do,
      TE.bind('item', () => deps.getTaskById(taskId)),
      TE.bind('content', () => deps.getTaskContent(taskId)),
      TE.map(({ item, content }): TaskItemDetails => ({ ...item, content })),
    );
