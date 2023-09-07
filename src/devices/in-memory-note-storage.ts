import * as A from 'fp-ts/Array';
import { flow, constVoid, constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  CanFindNotes,
  CanGetNoteById,
  CanGetNoteContent,
  CanRemoveNote,
  CanSaveNote,
  CanUpdateNoteContent,
} from '#/application/dependencies';
import { NoteItemShort } from '#/core/data/note-item';

type InMemoryNoteStorage = CanFindNotes &
  CanGetNoteById &
  CanSaveNote &
  CanRemoveNote &
  CanGetNoteContent &
  CanUpdateNoteContent;

const emptyNote: NoteItemShort = {
  id: '',
  title: '',
  isArchived: false,
};

export const createInMemoryNoteStorage = (seed: O.Option<NoteItemShort[]>): InMemoryNoteStorage => {
  const notesMap = pipe(
    seed,
    O.map(A.map((s): [string, NoteItemShort] => [s.id, s])),
    O.match(
      () => new Map<string, NoteItemShort>(),
      (s) => new Map<string, NoteItemShort>(s),
    ),
  );
  const contentMap = new Map<string, string>();

  return {
    findNotes: () =>
      pipe(
        TE.Do,
        TE.map(() => Array.from(notesMap.values())),
      ),
    getNoteById: flow(
      TE.of,
      TE.flatMap((id) => pipe(notesMap.get(id), TE.fromNullable(new Error('Not found')))),
    ),
    saveNote: (data) =>
      pipe(
        TE.of(data.id),
        TE.map(
          flow(
            O.map((id) =>
              pipe(
                O.fromNullable(notesMap.get(id)),
                O.getOrElse(constant<NoteItemShort>({ ...emptyNote, id })),
              ),
            ),
            O.getOrElse(constant<NoteItemShort>({ ...emptyNote, id: data.title + '_id' })),
          ),
        ),
        TE.map((existing) => ({
          ...existing,
          title: pipe(data.title, O.getOrElse(constant(existing.title))),
          isArchived: pipe(data.isArchived, O.getOrElse(constant(existing.isArchived))),
        })),
        TE.tap((item) => TE.of(notesMap.set(item.id, item))),
      ),
    removeNote: flow(
      TE.of,
      TE.map((id) => notesMap.delete(id)),
      TE.map(constVoid),
    ),
    getNoteContent: flow(
      TE.of,
      TE.map((id) => pipe(contentMap.get(id), O.fromNullable)),
    ),
    updateNoteContent: ({ id, content }) =>
      pipe(
        TE.Do,
        TE.map(() => contentMap.set(id, content)),
        TE.map(constVoid),
      ),
  };
};
