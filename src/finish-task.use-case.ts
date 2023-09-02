import { CanMarkTaskAsDone } from './dependencies';

export const finishTaskUseCase = (deps: CanMarkTaskAsDone) => deps.markAsDone;
