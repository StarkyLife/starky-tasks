import { CanRemoveTask } from './dependencies';

export const deleteTaskUseCase = (deps: CanRemoveTask) => deps.removeTask;
