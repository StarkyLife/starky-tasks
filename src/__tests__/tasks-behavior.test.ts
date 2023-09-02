import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { addTaskUseCase } from '#/add-task.use-case';
import { deleteTaskUseCase } from '#/delete-task.use-case';
import { createInMemoryStorage } from '#/devices/in-memory-storage';
import { editTaskNotesUseCase } from '#/edit-task-notes.use-case';
import { editTaskUseCase } from '#/edit-task.use-case';
import { finishTaskUseCase } from '#/finish-task.use-case';
import { getTaskDetailsUseCase } from '#/get-task-details.use-case';
import { getTasksUseCase } from '#/get-tasks.use-case';
import { reopenTaskUseCase } from '#/reopen-task.use-case';
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

test('can edit task notes', async () => {
  const storage = createInMemoryStorage();

  await expect(
    pipe(
      { title: 'new task title' },
      addTaskUseCase(storage),
      TE.map((item) => ({ id: item.id, notes: 'editted notes' })),
      TE.flatMap(editTaskNotesUseCase(storage)),
      TE.map((item) => item.id),
      TE.flatMap(getTaskDetailsUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual({
    id: expect.any(String),
    title: 'new task title',
    notes: 'editted notes',
    isDone: false,
  });
});

test('can finish task', async () => {
  const storage = createInMemoryStorage();

  await expect(
    pipe(
      { title: 'new task title' },
      addTaskUseCase(storage),
      TE.map((item) => item.id),
      TE.tap(finishTaskUseCase(storage)),
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

test('can reopen task', async () => {
  const storage = createInMemoryStorage();

  await expect(
    pipe(
      { title: 'new task title' },
      addTaskUseCase(storage),
      TE.map((item) => item.id),
      TE.tap(finishTaskUseCase(storage)),
      TE.tap(reopenTaskUseCase(storage)),
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
