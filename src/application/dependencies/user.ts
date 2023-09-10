import * as TE from 'fp-ts/TaskEither';
import { User } from '../lib/data/user';

export type CanCreateUser = {
  createUser: (login: string) => TE.TaskEither<Error, User>;
};
