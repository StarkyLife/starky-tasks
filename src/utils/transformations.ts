import { pipe } from 'fp-ts/function';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';

export const promiseFromTask = <A>(task: T.Task<A>) => task();
export const promiseFromTaskEither = <E, A>(taskEither: TE.TaskEither<E, A>): Promise<A> =>
  pipe(
    taskEither,
    TE.getOrElse((e) => {
      throw e;
    }),
    promiseFromTask,
  );
