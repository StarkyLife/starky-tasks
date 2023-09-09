import { constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  addTaskUseCase,
  getTasksUseCase,
  deleteTaskUseCase,
  editTaskUseCase,
  getTaskDetailsUseCase,
  editTaskContentUseCase,
  finishTaskUseCase,
  reopenTaskUseCase,
  moveTaskUseCase,
} from '#/application/task';
import { createInMemoryTaskStorage } from '#/devices/in-memory-task-storage';
import { promiseFromTaskEither } from '#/utils/transformations';
import { createDefaultTask } from './fixtures/task';

test('can add new task', async () => {
  const storage = createInMemoryTaskStorage(O.none);

  await expect(
    pipe(
      { title: 'new task title', parentId: O.none },
      addTaskUseCase(storage),
      TE.map(constant({ parentId: O.none })),
      TE.flatMap(getTasksUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      id: expect.any(String),
      title: 'new task title',
      isDone: false,
      parentId: O.none,
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
      TE.map(constant({ parentId: O.none })),
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
      TE.map(constant({ parentId: O.none })),
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
    content: O.none,
    tasks: [],
  });
});

test('can edit task content', async () => {
  const defaultTask = createDefaultTask();
  const storage = createInMemoryTaskStorage(O.some([defaultTask]));

  await expect(
    pipe(
      { id: defaultTask.id, content: 'editted content' },
      editTaskContentUseCase(storage),
      TE.map(() => defaultTask.id),
      TE.flatMap(getTaskDetailsUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual({
    ...defaultTask,
    content: O.some('editted content'),
    tasks: [],
  });
});

test('can finish task', async () => {
  const defaultTask = createDefaultTask({ isDone: false });
  const storage = createInMemoryTaskStorage(O.some([defaultTask]));

  await expect(
    pipe(
      defaultTask.id,
      finishTaskUseCase(storage),
      TE.map(constant({ parentId: O.none })),
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
      TE.map(constant({ parentId: O.none })),
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

test('can add new task to existing task', async () => {
  const defaultTask = createDefaultTask();
  const storage = createInMemoryTaskStorage(O.some([defaultTask]));

  await pipe(
    { title: 'new task title', parentId: O.some(defaultTask.id) },
    addTaskUseCase(storage),
    promiseFromTaskEither,
  );

  await expect(
    pipe(defaultTask.id, getTaskDetailsUseCase(storage), promiseFromTaskEither),
  ).resolves.toEqual({
    ...defaultTask,
    content: O.none,
    tasks: [
      {
        id: expect.any(String),
        title: 'new task title',
        isDone: false,
        parentId: O.some(defaultTask.id),
      },
    ],
  });

  await expect(
    pipe({ parentId: O.none }, getTasksUseCase(storage), promiseFromTaskEither),
  ).resolves.toEqual([defaultTask]);
});

test('can move task to another task', async () => {
  const parentTask = createDefaultTask({ id: 'parent', parentId: O.none });
  const childTask = createDefaultTask({ id: 'child', parentId: O.some(parentTask.id) });
  const anotherTask = createDefaultTask({ id: 'another', parentId: O.none });
  const storage = createInMemoryTaskStorage(O.some([parentTask, childTask, anotherTask]));

  await expect(
    pipe(
      { id: childTask.id, parentId: O.some(anotherTask.id) },
      moveTaskUseCase(storage),
      TE.map(constant({})),
      TE.bind('parentTaskDetails', () => pipe(parentTask.id, getTaskDetailsUseCase(storage))),
      TE.bind('anotherTaskDetails', () => pipe(anotherTask.id, getTaskDetailsUseCase(storage))),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual({
    parentTaskDetails: {
      ...parentTask,
      content: O.none,
      tasks: [],
    },
    anotherTaskDetails: {
      ...anotherTask,
      content: O.none,
      tasks: [
        {
          ...childTask,
          parentId: O.some(anotherTask.id),
        },
      ],
    },
  });
});
