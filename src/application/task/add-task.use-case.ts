import { CanCreateTask } from '../dependencies';

export const addTaskUseCase = (deps: CanCreateTask) => deps.createTask;
