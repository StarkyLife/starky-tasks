import * as TE from 'fp-ts/TaskEither';
import { FolderItemShort, FolderSaveData } from '#/core/data/folder-item';

export type CanFindFolders = {
  findFolders: () => TE.TaskEither<Error, FolderItemShort[]>;
};

export type CanSaveFolder = {
  saveFolder: (data: FolderSaveData) => TE.TaskEither<Error, FolderItemShort>;
};

export type CanGetFolderById = {
  getFolderById: (id: string) => TE.TaskEither<Error, FolderItemShort>;
};

export type CanRemoveFolder = {
  removeFolder: (id: string) => TE.TaskEither<Error, void>;
};
