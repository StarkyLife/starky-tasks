import * as O from 'fp-ts/Option';
import { CanSaveTask } from './dependencies';

export const reopenTaskUseCase = (deps: CanSaveTask) => (taskId: string) =>
  deps.saveTask({ id: O.some(taskId), title: O.none, isDone: O.some(false) });
