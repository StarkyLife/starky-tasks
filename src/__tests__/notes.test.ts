import { constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  addNoteUseCase,
  archiveNoteUseCase,
  changeNotesOrderUseCase,
  deleteNoteUseCase,
  editNoteContentUseCase,
  editNoteUseCase,
  getNoteDetailsUseCase,
  getNotesUseCase,
  moveNoteUseCase,
  restoreNoteUseCase,
} from '#/application/note';
import { createInMemoryNoteStorage } from '#/devices/in-memory-note-storage';
import { promiseFromTaskEither } from '#/utils/transformations';
import { createDefaultNote } from './fixtures/note';

test('can add new note', async () => {
  const storage = createInMemoryNoteStorage(O.none);

  await expect(
    pipe(
      { type: 'task', title: 'new task title', parentId: O.none },
      addNoteUseCase(storage),
      TE.map(constant({ parentId: O.none })),
      TE.flatMap(getNotesUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      id: expect.any(String),
      type: 'task',
      title: 'new task title',
      isArchived: false,
      parentId: O.none,
    },
  ]);
});

test('can delete note', async () => {
  const { defaultNote, storage } = await pipe(
    TE.Do,
    TE.bind('defaultNote', () => TE.fromEither(createDefaultNote())),
    TE.bind('storage', ({ defaultNote }) =>
      TE.of(createInMemoryNoteStorage(O.some([defaultNote]))),
    ),
    promiseFromTaskEither,
  );

  await expect(
    pipe(
      defaultNote.id,
      deleteNoteUseCase(storage),
      TE.map(constant({ parentId: O.none })),
      TE.flatMap(getNotesUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([]);
});

test('can edit note', async () => {
  const { defaultNote, storage } = await pipe(
    TE.Do,
    TE.bind('defaultNote', () => TE.fromEither(createDefaultNote({ title: 'initial title' }))),
    TE.bind('storage', ({ defaultNote }) =>
      TE.of(createInMemoryNoteStorage(O.some([defaultNote]))),
    ),
    promiseFromTaskEither,
  );

  await expect(
    pipe(
      { id: defaultNote.id, title: 'editted title' },
      editNoteUseCase(storage),
      TE.map(constant({ parentId: O.none })),
      TE.flatMap(getNotesUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      ...defaultNote,
      title: 'editted title',
    },
  ]);
});

test('can get note details', async () => {
  const { defaultNote, storage } = await pipe(
    TE.Do,
    TE.bind('defaultNote', () => TE.fromEither(createDefaultNote())),
    TE.bind('storage', ({ defaultNote }) =>
      TE.of(createInMemoryNoteStorage(O.some([defaultNote]))),
    ),
    promiseFromTaskEither,
  );

  await expect(
    pipe(defaultNote.id, getNoteDetailsUseCase(storage), promiseFromTaskEither),
  ).resolves.toEqual({
    ...defaultNote,
    content: O.none,
    children: [],
  });
});

test('can edit note content', async () => {
  const { defaultNote, storage } = await pipe(
    TE.Do,
    TE.bind('defaultNote', () => TE.fromEither(createDefaultNote())),
    TE.bind('storage', ({ defaultNote }) =>
      TE.of(createInMemoryNoteStorage(O.some([defaultNote]))),
    ),
    promiseFromTaskEither,
  );

  await expect(
    pipe(
      { id: defaultNote.id, content: 'editted content' },
      editNoteContentUseCase(storage),
      TE.map(() => defaultNote.id),
      TE.flatMap(getNoteDetailsUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual({
    ...defaultNote,
    content: O.some('editted content'),
    children: [],
  });
});

test('can finish note', async () => {
  const { defaultNote, storage } = await pipe(
    TE.Do,
    TE.bind('defaultNote', () => TE.fromEither(createDefaultNote({ isArchived: false }))),
    TE.bind('storage', ({ defaultNote }) =>
      TE.of(createInMemoryNoteStorage(O.some([defaultNote]))),
    ),
    promiseFromTaskEither,
  );

  await expect(
    pipe(
      defaultNote.id,
      archiveNoteUseCase(storage),
      TE.map(constant({ parentId: O.none })),
      TE.flatMap(getNotesUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      ...defaultNote,
      isArchived: true,
    },
  ]);
});

test('can reopen note', async () => {
  const { defaultNote, storage } = await pipe(
    TE.Do,
    TE.bind('defaultNote', () => TE.fromEither(createDefaultNote({ isArchived: true }))),
    TE.bind('storage', ({ defaultNote }) =>
      TE.of(createInMemoryNoteStorage(O.some([defaultNote]))),
    ),
    promiseFromTaskEither,
  );

  await expect(
    pipe(
      defaultNote.id,
      restoreNoteUseCase(storage),
      TE.map(constant({ parentId: O.none })),
      TE.flatMap(getNotesUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      ...defaultNote,
      isArchived: false,
    },
  ]);
});

test('can add new note to existing note', async () => {
  const { defaultNote, storage } = await pipe(
    TE.Do,
    TE.bind('defaultNote', () => TE.fromEither(createDefaultNote())),
    TE.bind('storage', ({ defaultNote }) =>
      TE.of(createInMemoryNoteStorage(O.some([defaultNote]))),
    ),
    promiseFromTaskEither,
  );

  await pipe(
    { type: 'note', title: 'new note title', parentId: O.some(defaultNote.id) },
    addNoteUseCase(storage),
    promiseFromTaskEither,
  );

  await expect(
    pipe(defaultNote.id, getNoteDetailsUseCase(storage), promiseFromTaskEither),
  ).resolves.toEqual({
    ...defaultNote,
    content: O.none,
    children: [
      {
        id: expect.any(String),
        type: 'note',
        title: 'new note title',
        isArchived: false,
        parentId: O.some(defaultNote.id),
      },
    ],
  });

  await expect(
    pipe({ parentId: O.none }, getNotesUseCase(storage), promiseFromTaskEither),
  ).resolves.toEqual([defaultNote]);
});

test('can move note to another note', async () => {
  const { parentNote, childNote, anotherNote, storage } = await pipe(
    TE.Do,
    TE.bind('parentNote', () =>
      TE.fromEither(createDefaultNote({ id: 'parent', parentId: O.none })),
    ),
    TE.bind('childNote', ({ parentNote }) =>
      TE.fromEither(createDefaultNote({ id: 'child', parentId: O.some(parentNote.id) })),
    ),
    TE.bind('anotherNote', () =>
      TE.fromEither(createDefaultNote({ id: 'another', parentId: O.none })),
    ),
    TE.bind('storage', ({ parentNote, childNote, anotherNote }) =>
      TE.of(createInMemoryNoteStorage(O.some([parentNote, childNote, anotherNote]))),
    ),
    promiseFromTaskEither,
  );

  await expect(
    pipe(
      { id: childNote.id, parentId: O.some(anotherNote.id) },
      moveNoteUseCase(storage),
      TE.map(constant({})),
      TE.bind('parentNoteDetails', () => pipe(parentNote.id, getNoteDetailsUseCase(storage))),
      TE.bind('anotherNoteDetails', () => pipe(anotherNote.id, getNoteDetailsUseCase(storage))),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual({
    parentNoteDetails: {
      ...parentNote,
      content: O.none,
      children: [],
    },
    anotherNoteDetails: {
      ...anotherNote,
      content: O.none,
      children: [
        {
          ...childNote,
          parentId: O.some(anotherNote.id),
        },
      ],
    },
  });
});

test('can save notes order', async () => {
  const { firstNote, secondNote, storage } = await pipe(
    TE.Do,
    TE.bind('firstNote', () => TE.fromEither(createDefaultNote({ id: 'first' }))),
    TE.bind('secondNote', () => TE.fromEither(createDefaultNote({ id: 'second' }))),
    TE.bind('storage', ({ firstNote, secondNote }) =>
      TE.of(createInMemoryNoteStorage(O.some([firstNote, secondNote]))),
    ),
    promiseFromTaskEither,
  );

  await expect(
    pipe(
      { id: O.none, childrenIdsInOrder: [secondNote.id, firstNote.id] },
      changeNotesOrderUseCase(storage),
      TE.map(constant({ parentId: O.none })),
      TE.flatMap(getNotesUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([secondNote, firstNote]);
});
