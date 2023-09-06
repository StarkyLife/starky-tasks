import * as O from 'fp-ts/Option';
import { FolderUpdateData } from '#/core/data/folder-item';
import { CanSaveFolder } from '../dependencies';

export const editFolderUseCase =
  (deps: CanSaveFolder) =>
  ({ id, name }: FolderUpdateData) =>
    deps.saveFolder({ id: O.some(id), name: O.some(name), isArchived: O.none });
