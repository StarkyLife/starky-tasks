import * as O from 'fp-ts/Option';
import { NoteItemShort } from '#/application/lib/data/note-item';

export const createDefaultNote = (override?: Partial<NoteItemShort>): NoteItemShort => ({
  id: Date.now().toString(),
  type: 'note',
  title: 'random title',
  isArchived: false,
  parentId: O.none,
  ...override,
});
