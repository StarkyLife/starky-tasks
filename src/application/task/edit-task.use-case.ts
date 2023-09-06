import * as O from 'fp-ts/Option';
import { TaskUpdateData } from '#/core/data/task-item';
import { CanSaveTask } from '../dependencies';

export const editTaskUseCase =
  (deps: CanSaveTask) =>
  ({ id, title }: TaskUpdateData) =>
    deps.saveTask({ id: O.some(id), title: O.some(title), isDone: O.none });
