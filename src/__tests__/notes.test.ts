import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  addNoteUseCase,
  getNotesUseCase,
  editNoteUseCase,
  deleteNoteUseCase,
  archiveNoteUseCase,
  restoreNoteUseCase,
  getNoteDetailsUseCase,
  editNoteContentUseCase,
} from '#/application/note';
import { createInMemoryNoteStorage } from '#/devices/in-memory-note-storage';
import { promiseFromTaskEither } from '#/utils/transformations';
import { createDefaultNote } from './fixtures/note';

test('can add new note', async () => {
  const storage = createInMemoryNoteStorage(O.none);

  await expect(
    pipe(
      'new note title',
      addNoteUseCase(storage),
      TE.flatMap(getNotesUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      id: expect.any(String),
      title: 'new note title',
      isArchived: false,
    },
  ]);
});

test('can update note', async () => {
  const defaultNote = createDefaultNote({ title: 'initial title' });
  const storage = createInMemoryNoteStorage(O.some([defaultNote]));

  await expect(
    pipe(
      { id: defaultNote.id, title: 'updated note title' },
      editNoteUseCase(storage),
      TE.flatMap(getNotesUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      ...defaultNote,
      title: 'updated note title',
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
      TE.flatMap(getNotesUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([]);
});

test('can archive note', async () => {
  const defaultNote = createDefaultNote({ isArchived: false });
  const storage = createInMemoryNoteStorage(O.some([defaultNote]));

  await expect(
    pipe(
      defaultNote.id,
      archiveNoteUseCase(storage),
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

test('can restore note', async () => {
  const defaultNote = createDefaultNote({ isArchived: true });
  const storage = createInMemoryNoteStorage(O.some([defaultNote]));

  await expect(
    pipe(
      defaultNote.id,
      restoreNoteUseCase(storage),
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

test("can get note's details", async () => {
  const defaultNote = createDefaultNote();
  const storage = createInMemoryNoteStorage(O.some([defaultNote]));

  await expect(
    pipe(defaultNote.id, getNoteDetailsUseCase(storage), promiseFromTaskEither),
  ).resolves.toEqual({
    ...defaultNote,
    content: O.none,
  });
});

test("can edit note's content", async () => {
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
  });
});
