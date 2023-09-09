import * as O from 'fp-ts/Option';
import { TaskTitleUpdateData } from '#/core/data/task-item';
import { CanUpdateTask } from '../dependencies';

export const editTaskUseCase =
  (deps: CanUpdateTask) =>
  ({ id, title }: TaskTitleUpdateData) =>
    deps.updateTask({ id, title: O.some(title), isDone: O.none, parentId: O.none });
