import * as A from 'fp-ts/Array';
import { pipe, constant } from 'fp-ts/function';
import * as M from 'fp-ts/Map';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/string';
import { NoteItemId, NoteItemShort } from './data/note-item';

const createNotesMap = (notes: NoteItemShort[]) => new Map(notes.map((n) => [n.id, n]));
const lookupId = M.lookup(S.Eq);
const lookupIdIn = (notesMap: Map<NoteItemId, NoteItemShort>) => (id: NoteItemId) =>
  lookupId(id, notesMap);

const noteNotIn = (order: NoteItemId[]) => (note: NoteItemShort) => !order.includes(note.id);

const repositionNotes = (notes: NoteItemShort[]) => (noteIdsInOrder: NoteItemId[]) =>
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
  (noteIdsInOrder: O.Option<NoteItemId[]>): NoteItemShort[] =>
    pipe(noteIdsInOrder, O.map(repositionNotes(notes)), O.getOrElse(constant(notes)));
