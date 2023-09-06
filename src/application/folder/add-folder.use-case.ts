import * as O from 'fp-ts/Option';
import { CanSaveFolder } from '../dependencies';

export const addFolderUseCase = (deps: CanSaveFolder) => (name: string) =>
  deps.saveFolder({ id: O.none, name: O.some(name), isArchived: O.some(false) });
