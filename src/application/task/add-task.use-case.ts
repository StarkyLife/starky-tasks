import * as O from 'fp-ts/Option';
import { CanSaveTask } from '../dependencies';

export const addTaskUseCase = (deps: CanSaveTask) => (title: string) =>
  deps.saveTask({ id: O.none, title: O.some(title), isDone: O.some(false) });
