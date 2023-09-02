import { CanSetTaskState } from './dependencies';

export const finishTaskUseCase = (deps: CanSetTaskState) => (taskId: string) =>
  deps.setTaskState(taskId, { isDone: true });
