import * as O from 'fp-ts/Option';

export type FolderItemShort = {
  id: string;
  name: string;
  isArchived: boolean;
};

export type FolderSaveData = {
  id: O.Option<string>;
  name: O.Option<string>;
  isArchived: O.Option<boolean>;
};

export type FolderUpdateData = {
  id: string;
  name: string;
};
