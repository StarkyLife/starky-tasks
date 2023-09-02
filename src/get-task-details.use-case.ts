import { CanGetTaskById } from './dependencies';

export const getTaskDetailsUseCase = (deps: CanGetTaskById) => deps.getTaskById;
