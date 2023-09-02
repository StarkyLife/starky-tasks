import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { addTaskUseCase } from '#/add-task.use-case';
import { deleteTaskUseCase } from '#/delete-task.use-case';
import { createInMemoryStorage } from '#/devices/in-memory-storage';
import { editTaskUseCase } from '#/edit-task.use-case';
import { finishTaskUseCase } from '#/finish-task.use-case';
import { getTasksUseCase } from '#/get-tasks.use-case';
import { promiseFromTaskEither } from '#/utils/transformations';

test('can add new task', async () => {
  const storage = createInMemoryStorage();

  await expect(
    pipe(
      { title: 'new task title' },
      addTaskUseCase(storage),
      TE.flatMap(getTasksUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      id: expect.any(String),
      title: 'new task title',
      isDone: false,
    },
  ]);
});

test('can delete task', async () => {
  const storage = createInMemoryStorage();

  await expect(
    pipe(
      { title: 'new task title' },
      addTaskUseCase(storage),
      TE.map((item) => item.id),
      TE.flatMap(deleteTaskUseCase(storage)),
      TE.flatMap(getTasksUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([]);
});

test('can edit task', async () => {
  const storage = createInMemoryStorage();

  await expect(
    pipe(
      { title: 'new task title' },
      addTaskUseCase(storage),
      TE.map((item) => ({ id: item.id, title: 'editted title' })),
      TE.flatMap(editTaskUseCase(storage)),
      TE.flatMap(getTasksUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      id: expect.any(String),
      title: 'editted title',
      isDone: false,
    },
  ]);
});

test('can mark task as done', async () => {
  const storage = createInMemoryStorage();

  await expect(
    pipe(
      { title: 'new task title' },
      addTaskUseCase(storage),
      TE.map((item) => item.id),
      TE.flatMap(finishTaskUseCase(storage)),
      TE.flatMap(getTasksUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      id: expect.any(String),
      title: 'new task title',
      isDone: true,
    },
  ]);
});
