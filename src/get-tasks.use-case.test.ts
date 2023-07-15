import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { TaskItem } from './core/data/task-item';
import { getTasksUseCase } from './get-tasks.use-case';
import { promiseFromTaskEither } from './utils/transformations';

it('should return all tasks', async () => {
  const tasks: TaskItem[] = [
    {
      id: '1',
      title: 'title',
    },
  ];

  await expect(
    pipe(
      getTasksUseCase({
        findTasks: TE.of(tasks),
      }),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual(tasks);
});
