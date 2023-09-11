import { constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { registerUserUseCase } from '#/application/user';
import { addVaultUseCase, getUserVaultsUseCase, renameVaultUseCase } from '#/application/vault';
import { createInMemoryRepository } from '#/devices/in-memory-repository';
import { promiseFromTaskEither } from '#/utils/transformations';
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
      TE.bind('storage', ({ defaultUser, defaultVault }) =>
        TE.of(
          createInMemoryRepository(
            O.some({
              user: defaultUser,
              vaults: [defaultVault],
            }),
            O.none,
          ),
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
