import { NoteItemShort } from '#/core/data/note-item';

export const createDefaultNote = (override?: Partial<NoteItemShort>): NoteItemShort => ({
  id: 'randomId',
  title: 'random title',
  isArchived: false,
  ...override,
});
