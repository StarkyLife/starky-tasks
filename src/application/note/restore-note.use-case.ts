import * as O from 'fp-ts/Option';
import { CanSaveNote } from '../dependencies';

export const restoreNoteUseCase = (deps: CanSaveNote) => (id: string) =>
  deps.saveNote({ id: O.some(id), title: O.none, isArchived: O.some(false) });
