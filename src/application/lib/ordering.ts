import * as A from 'fp-ts/Array';
import { pipe, constant } from 'fp-ts/function';
import * as M from 'fp-ts/Map';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/string';
import { NoteItemShort } from './data/note-item';

const createNotesMap = (notes: NoteItemShort[]) => new Map(notes.map((n) => [n.id, n]));
const lookupId = M.lookup(S.Eq);
const lookupIdIn = (notesMap: Map<string, NoteItemShort>) => (id: string) => lookupId(id, notesMap);

const noteNotIn = (order: string[]) => (note: NoteItemShort) => !order.includes(note.id);

const repositionNotes = (notes: NoteItemShort[]) => (noteIdsInOrder: string[]) =>
  pipe(
    createNotesMap(notes),
    (notesMap) => pipe(noteIdsInOrder, A.filterMap(lookupIdIn(notesMap))),
    (orderedNotes) =>
      orderedNotes.length === notes.length
        ? orderedNotes
        : [...orderedNotes, ...notes.filter(noteNotIn(noteIdsInOrder))],
  );

export const repositionNotesByOrder =
  (notes: NoteItemShort[]) =>
  (noteIdsInOrder: O.Option<string[]>): NoteItemShort[] =>
    pipe(noteIdsInOrder, O.map(repositionNotes(notes)), O.getOrElse(constant(notes)));
