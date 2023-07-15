import * as TE from 'fp-ts/TaskEither';
import { TaskItem } from './core/data/task-item';

export type CanFindTasks = {
  findTasks: TE.TaskEither<Error, TaskItem[]>;
};
