import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { addFolderUseCase } from '#/application/folder/add-folder.use-case';
import { archiveFolderUseCase } from '#/application/folder/archive-folder.use-case';
import { deleteFolderUseCase } from '#/application/folder/delete-folder.use-case';
import { editFolderUseCase } from '#/application/folder/edit-folder.use-case';
import { getFoldersUseCase } from '#/application/folder/get-folders.use-case';
import { restoreFolderUseCase } from '#/application/folder/restore-folder.use-case';
import { createInMemoryFolderStorage } from '#/devices/in-memory-folder-storage';
import { promiseFromTaskEither } from '#/utils/transformations';
import { createDefaultFolder } from './fixtures/folder';

test('can add new folder', async () => {
  const storage = createInMemoryFolderStorage(O.none);

  await expect(
    pipe(
      'new folder name',
      addFolderUseCase(storage),
      TE.flatMap(getFoldersUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      id: expect.any(String),
      name: 'new folder name',
      isArchived: false,
    },
  ]);
});

test('can update folder', async () => {
  const defaultFolder = createDefaultFolder({ name: 'initial name' });
  const storage = createInMemoryFolderStorage(O.some([defaultFolder]));

  await expect(
    pipe(
      { id: defaultFolder.id, name: 'updated folder name' },
      editFolderUseCase(storage),
      TE.flatMap(getFoldersUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      ...defaultFolder,
      name: 'updated folder name',
    },
  ]);
});

test('can delete folder', async () => {
  const defaultFolder = createDefaultFolder();
  const storage = createInMemoryFolderStorage(O.some([defaultFolder]));

  await expect(
    pipe(
      defaultFolder.id,
      deleteFolderUseCase(storage),
      TE.flatMap(getFoldersUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([]);
});

test('can archive folder', async () => {
  const defaultFolder = createDefaultFolder({ isArchived: false });
  const storage = createInMemoryFolderStorage(O.some([defaultFolder]));

  await expect(
    pipe(
      defaultFolder.id,
      archiveFolderUseCase(storage),
      TE.flatMap(getFoldersUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      ...defaultFolder,
      isArchived: true,
    },
  ]);
});

test('can restore folder', async () => {
  const defaultFolder = createDefaultFolder({ isArchived: true });
  const storage = createInMemoryFolderStorage(O.some([defaultFolder]));

  await expect(
    pipe(
      defaultFolder.id,
      restoreFolderUseCase(storage),
      TE.flatMap(getFoldersUseCase(storage)),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      ...defaultFolder,
      isArchived: false,
    },
  ]);
});
