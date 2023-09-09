import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { TaskItemDetails } from '#/core/data/task-item';
import { CanFindTasks, CanGetTaskById, CanGetTaskContent } from '../dependencies';

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
