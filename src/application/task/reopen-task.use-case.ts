import * as O from 'fp-ts/Option';
import { CanUpdateTask } from '../dependencies';

export const reopenTaskUseCase = (deps: CanUpdateTask) => (id: string) =>
  deps.updateTask({ id, title: O.none, isDone: O.some(false), parentId: O.none });
