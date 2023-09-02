import { CanInsertTask } from './dependencies';

export const addTaskUseCase = (deps: CanInsertTask) => deps.insertTask;
