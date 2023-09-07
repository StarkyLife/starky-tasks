import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { addNoteUseCase } from '#/application/note/add-note.use-case';
import { archiveNoteUseCase } from '#/application/note/archive-note.use-case';
import { deleteNoteUseCase } from '#/application/note/delete-note.use-case';
import { editNoteUseCase } from '#/application/note/edit-note.use-case';
import { getNotesUseCase } from '#/application/note/get-notes.use-case';
import { restoreNoteUseCase } from '#/application/note/restore-note.use-case';
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
