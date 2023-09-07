import * as O from 'fp-ts/Option';
import { CanSaveNote } from '../dependencies';

export const addNoteUseCase = (deps: CanSaveNote) => (title: string) =>
  deps.saveNote({ id: O.none, title: O.some(title), isArchived: O.some(false) });
