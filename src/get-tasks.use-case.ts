import * as TE from 'fp-ts/TaskEither';
import { TaskItem } from './core/data/task-item';
import { CanFindTasks } from './dependencies';

type GetTasksUseCase = TE.TaskEither<Error, TaskItem[]>;

export const getTasksUseCase = (deps: CanFindTasks): GetTasksUseCase => deps.findTasks;
