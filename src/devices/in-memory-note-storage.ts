import * as A from 'fp-ts/Array';
import { flow, constVoid, constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/string';
import * as TE from 'fp-ts/TaskEither';
import {
  CanCreateNote,
  CanFindNotes,
  CanGetNoteById,
  CanGetNoteContent,
  CanRemoveNote,
  CanUpdateNote,
  CanUpdateNoteContent,
} from '#/application/dependencies';
import { NoteItemShort } from '#/application/lib/data/note-item';

type InMemoryNoteStorage = CanFindNotes &
  CanGetNoteById &
  CanCreateNote &
  CanUpdateNote &
  CanRemoveNote &
  CanGetNoteContent &
  CanUpdateNoteContent;

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
    findNotes: (criteria) =>
      pipe(
        TE.Do,
        TE.map(() => Array.from(notesMap.values())),
        TE.map(A.filter(({ parentId }) => O.getEq(S.Eq).equals(parentId, criteria.parentId))),
      ),
    getNoteById: flow(
      TE.of,
      TE.flatMap((id) => pipe(notesMap.get(id), TE.fromNullable(new Error('Not found')))),
    ),
    createNote: ({ type, title, parentId }) =>
      pipe(
        TE.of<Error, NoteItemShort>({
          id: title + '_id',
          type,
          title,
          parentId,
          isArchived: false,
        }),
        TE.tap((item) => TE.of(notesMap.set(item.id, item))),
      ),
    updateNote: ({ id, title, isArchived, parentId }) =>
      pipe(
        TE.Do,
        TE.flatMap(() => pipe(notesMap.get(id), TE.fromNullable(new Error('Not found')))),
        TE.map(
          (existing): NoteItemShort => ({
            ...existing,
            title: pipe(title, O.getOrElse(constant(existing.title))),
            isArchived: pipe(isArchived, O.getOrElse(constant(existing.isArchived))),
            parentId: pipe(parentId, O.getOrElse(constant(existing.parentId))),
          }),
        ),
        TE.tap((item) => TE.of(notesMap.set(item.id, item))),
      ),
    removeNote: (id) =>
      pipe(
        TE.Do,
        TE.map(() => notesMap.delete(id)),
        TE.map(() => contentMap.delete(id)),
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
