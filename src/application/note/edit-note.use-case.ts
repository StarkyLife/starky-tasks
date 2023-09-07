import * as O from 'fp-ts/Option';
import { NoteUpdateData } from '#/core/data/note-item';
import { CanSaveNote } from '../dependencies';

export const editNoteUseCase =
  (deps: CanSaveNote) =>
  ({ id, title }: NoteUpdateData) =>
    deps.saveNote({ id: O.some(id), title: O.some(title), isArchived: O.none });
