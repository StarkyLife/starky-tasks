import * as O from 'fp-ts/Option';
import { TaskRelationUpdateData } from '#/core/data/task-item';
import { CanUpdateTask } from '../dependencies';

export const moveTaskUseCase =
  (deps: CanUpdateTask) =>
  ({ id, parentId }: TaskRelationUpdateData) =>
    deps.updateTask({ id, title: O.none, isDone: O.none, parentId: O.some(parentId) });
