import { CanSetTaskState } from './dependencies';

export const reopenTaskUseCase = (deps: CanSetTaskState) => (taskId: string) =>
  deps.setTaskState(taskId, { isDone: false });
