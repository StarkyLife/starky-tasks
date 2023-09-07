import { CanRemoveNote } from '../dependencies';

export const deleteNoteUseCase = (deps: CanRemoveNote) => deps.removeNote;
