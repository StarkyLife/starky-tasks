import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { Errors } from 'io-ts';
import { User, UserId } from '#/application/lib/data/user';

let uniqueCount = 0;

export const createDefaultUser = (override?: Partial<User>): E.Either<Errors, User> =>
  pipe(
    UserId.decode(Date.now().toString() + '_' + uniqueCount++),
    E.map((id): User => ({ id, login: 'userLogin', ...override })),
  );
