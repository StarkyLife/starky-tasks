import { CanFindTasks } from './dependencies';

export const getTasksUseCase = (deps: CanFindTasks) => deps.findTasks;
