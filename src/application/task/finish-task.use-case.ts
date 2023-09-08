import * as O from 'fp-ts/Option';
import { CanUpdateTask } from '../dependencies';

export const finishTaskUseCase = (deps: CanUpdateTask) => (id: string) =>
  deps.updateTask({ id, title: O.none, isDone: O.some(true), parentTaskId: O.none });
