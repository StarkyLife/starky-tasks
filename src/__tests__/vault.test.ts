import { constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { getNotesUseCase } from '#/application/note';
import { registerUserUseCase } from '#/application/user';
import {
  addVaultUseCase,
  deleteVaultUseCase,
  getUserVaultsUseCase,
  renameVaultUseCase,
} from '#/application/vault';
import { createInMemoryRepository } from '#/devices/in-memory-repository';
import { promiseFromTaskEither } from '#/utils/transformations';
import { createDefaultNote } from './fixtures/note';
import { createDefaultUser } from './fixtures/user';
import { createDefaultVault } from './fixtures/vault';

it('should create vault', async () => {
  const storage = createInMemoryRepository(O.none, O.none);

  await expect(
    pipe(
      'user-login',
      registerUserUseCase(storage),
      TE.flatMap((user) =>
        pipe(
          { name: 'vault name', creatorId: user.id },
          addVaultUseCase(storage),
          TE.map(constant({ userId: user.id })),
          TE.flatMap(getUserVaultsUseCase(storage)),
        ),
      ),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      id: expect.any(String),
      name: 'vault name',
    },
  ]);
});

it('should rename vault', async () => {
  await expect(
    pipe(
      TE.Do,
      TE.bind('defaultUser', () => TE.fromEither(createDefaultUser())),
      TE.bind('defaultVault', () => TE.fromEither(createDefaultVault({ name: 'old vault name' }))),
      TE.let('storage', ({ defaultUser, defaultVault }) =>
        createInMemoryRepository(
          O.some({
            user: defaultUser,
            vaults: [defaultVault],
          }),
          O.none,
        ),
      ),
      TE.flatMap(({ storage, defaultUser, defaultVault }) =>
        pipe(
          { id: defaultVault.id, name: 'new vault name' },
          renameVaultUseCase(storage),
          TE.map(constant({ userId: defaultUser.id })),
          TE.flatMap(getUserVaultsUseCase(storage)),
        ),
      ),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual([
    {
      id: expect.any(String),
      name: 'new vault name',
    },
  ]);
});

it('should delete vault', async () => {
  await expect(
    pipe(
      TE.Do,
      TE.bind('defaultUser', () => TE.fromEither(createDefaultUser())),
      TE.bind('defaultVault', () => TE.fromEither(createDefaultVault())),
      TE.bind('defaultNote', ({ defaultVault }) =>
        TE.fromEither(createDefaultNote({ vaultId: defaultVault.id })),
      ),
      TE.let('storage', ({ defaultUser, defaultVault, defaultNote }) =>
        createInMemoryRepository(
          O.some({
            user: defaultUser,
            vaults: [defaultVault],
          }),
          O.some([defaultNote]),
        ),
      ),
      TE.flatMap(({ storage, defaultUser, defaultVault }) =>
        pipe(
          defaultVault.id,
          deleteVaultUseCase(storage),
          TE.map(constant({ userId: defaultUser.id })),
          TE.flatMap(getUserVaultsUseCase(storage)),
          TE.bindTo('vaults'),
          TE.bind('notes', () => pipe({ parentId: O.none }, getNotesUseCase(storage))),
        ),
      ),
      promiseFromTaskEither,
    ),
  ).resolves.toEqual({
    vaults: [],
    notes: [],
  });
});
