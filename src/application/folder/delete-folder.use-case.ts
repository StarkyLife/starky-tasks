import { CanRemoveFolder } from '../dependencies';

export const deleteFolderUseCase = (deps: CanRemoveFolder) => deps.removeFolder;
