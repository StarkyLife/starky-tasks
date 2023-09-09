import { constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  addNoteUseCase,
  archiveNoteUseCase,
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
  const defaultNote = createDefaultNote();
  const storage = createInMemoryNoteStorage(O.some([defaultNote]));

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
  const defaultNote = createDefaultNote({ title: 'initial title' });
  const storage = createInMemoryNoteStorage(O.some([defaultNote]));

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
  const defaultNote = createDefaultNote();
  const storage = createInMemoryNoteStorage(O.some([defaultNote]));

  await expect(
    pipe(defaultNote.id, getNoteDetailsUseCase(storage), promiseFromTaskEither),
  ).resolves.toEqual({
    ...defaultNote,
    content: O.none,
    children: [],
  });
});

test('can edit note content', async () => {
  const defaultNote = createDefaultNote();
  const storage = createInMemoryNoteStorage(O.some([defaultNote]));

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
  const defaultNote = createDefaultNote({ isArchived: false });
  const storage = createInMemoryNoteStorage(O.some([defaultNote]));

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
  const defaultNote = createDefaultNote({ isArchived: true });
  const storage = createInMemoryNoteStorage(O.some([defaultNote]));

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
  const defaultNote = createDefaultNote();
  const storage = createInMemoryNoteStorage(O.some([defaultNote]));

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
  const parentNote = createDefaultNote({ id: 'parent', parentId: O.none });
  const childNote = createDefaultNote({ id: 'child', parentId: O.some(parentNote.id) });
  const anotherNote = createDefaultNote({ id: 'another', parentId: O.none });
  const storage = createInMemoryNoteStorage(O.some([parentNote, childNote, anotherNote]));

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
