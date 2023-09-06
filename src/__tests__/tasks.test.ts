import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { addTaskUseCase } from '#/application/task/add-task.use-case';
import { deleteTaskUseCase } from '#/application/task/delete-task.use-case';
import { editTaskNotesUseCase } from '#/application/task/edit-task-notes.use-case';
import { editTaskUseCase } from '#/application/task/edit-task.use-case';
import { finishTaskUseCase } from '#/application/task/finish-task.use-case';
import { getTaskDetailsUseCase } from '#/application/task/get-task-details.use-case';
import { getTasksUseCase } from '#/application/task/get-tasks.use-case';
import { reopenTaskUseCase } from '#/application/task/reopen-task.use-case';
import { createInMemoryTaskStorage } from '#/devices/in-memory-task-storage';
import { promiseFromTaskEither } from '#/utils/transformations';
import { createDefaultTask } from './fixtures/task';

test('can add new task', async () => {
  const storage = createInMemoryTaskStorage(O.none);

  await expect(
    pipe(
      'new task title',
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
  const defaultTask = createDefaultTask();
  const storage = createInMemoryTaskStorage(O.some([defaultTask]));

  await expect(
    pipe(
      defaultTask.id,
      deleteTaskUseCase(storage),
      TE.flatMap(getTasksUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([]);
});

test('can edit task', async () => {
  const defaultTask = createDefaultTask({ title: 'initial title' });
  const storage = createInMemoryTaskStorage(O.some([defaultTask]));

  await expect(
    pipe(
      { id: defaultTask.id, title: 'editted title' },
      editTaskUseCase(storage),
      TE.flatMap(getTasksUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      ...defaultTask,
      title: 'editted title',
    },
  ]);
});

test('can get task details', async () => {
  const defaultTask = createDefaultTask();
  const storage = createInMemoryTaskStorage(O.some([defaultTask]));

  await expect(
    pipe(defaultTask.id, getTaskDetailsUseCase(storage), promiseFromTaskEither),
  ).resolves.toEqual({
    ...defaultTask,
    notes: O.none,
  });
});

test('can edit task notes', async () => {
  const defaultTask = createDefaultTask();
  const storage = createInMemoryTaskStorage(O.some([defaultTask]));

  await expect(
    pipe(
      { id: defaultTask.id, notes: 'editted notes' },
      editTaskNotesUseCase(storage),
      TE.map(() => defaultTask.id),
      TE.flatMap(getTaskDetailsUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual({
    ...defaultTask,
    notes: O.some('editted notes'),
  });
});

test('can finish task', async () => {
  const defaultTask = createDefaultTask({ isDone: false });
  const storage = createInMemoryTaskStorage(O.some([defaultTask]));

  await expect(
    pipe(
      defaultTask.id,
      finishTaskUseCase(storage),
      TE.flatMap(getTasksUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      ...defaultTask,
      isDone: true,
    },
  ]);
});

test('can reopen task', async () => {
  const defaultTask = createDefaultTask({ isDone: true });
  const storage = createInMemoryTaskStorage(O.some([defaultTask]));

  await expect(
    pipe(
      defaultTask.id,
      reopenTaskUseCase(storage),
      TE.flatMap(getTasksUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      ...defaultTask,
      isDone: false,
    },
  ]);
});
