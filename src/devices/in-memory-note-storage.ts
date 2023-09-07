import * as A from 'fp-ts/Array';
import { constVoid, constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  CanFindNotes,
  CanGetNoteById,
  CanRemoveNote,
  CanSaveNote,
} from '#/application/dependencies';
import { NoteItemShort } from '#/core/data/note-item';

type InMemoryNoteStorage = CanFindNotes & CanGetNoteById & CanSaveNote & CanRemoveNote;

export const createInMemoryNoteStorage = (seed: O.Option<NoteItemShort[]>): InMemoryNoteStorage => {
  const notesMap = pipe(
    seed,
    O.map(A.map((s): [string, NoteItemShort] => [s.id, s])),
    O.match(
      () => new Map<string, NoteItemShort>(),
      (s) => new Map<string, NoteItemShort>(s),
    ),
  );

  return {
    findNotes: () => TE.of(Array.from(notesMap.values())),
    getNoteById: (id) => pipe(notesMap.get(id), TE.fromNullable(new Error('Not found'))),
    saveNote: (data) =>
      pipe(
        data.id,
        O.flatMap((id) => O.fromNullable(notesMap.get(id))),
        O.getOrElse(
          constant<NoteItemShort>({ id: data.title + '_id', title: '', isArchived: false }),
        ),
        (existing) =>
          TE.of<Error, NoteItemShort>({
            ...existing,
            title: pipe(data.title, O.getOrElse(constant(existing.title))),
            isArchived: pipe(data.isArchived, O.getOrElse(constant(existing.isArchived))),
          }),
        TE.tap((item) => TE.of(notesMap.set(item.id, item))),
      ),
    removeNote: (id) => pipe(TE.of(notesMap.delete(id)), TE.map(constVoid)),
  };
};
