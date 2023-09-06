import * as O from 'fp-ts/Option';
import { CanSaveFolder } from '../dependencies';

export const restoreFolderUseCase = (deps: CanSaveFolder) => (id: string) =>
  deps.saveFolder({ id: O.some(id), name: O.none, isArchived: O.some(false) });
