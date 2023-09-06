import { TaskItemShort } from '#/core/data/task-item';

export const createDefaultTask = (override?: Partial<TaskItemShort>): TaskItemShort => ({
  id: 'randomId',
  title: 'task title',
  isDone: false,
  ...override,
});
