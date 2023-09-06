import { FolderItemShort } from '#/core/data/folder-item';

export const createDefaultFolder = (override?: Partial<FolderItemShort>): FolderItemShort => ({
  id: 'randomId',
  name: 'random name',
  isArchived: false,
  ...override,
});
