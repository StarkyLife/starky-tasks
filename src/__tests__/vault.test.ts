import { constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { registerUserUseCase } from '#/application/user';
import { addVaultUseCase, getUserVaultsUseCase, renameVaultUseCase } from '#/application/vault';
import { createInMemoryVaultStorage } from '#/devices/in-memory-vault-storage';
import { promiseFromTaskEither } from '#/utils/transformations';

it('should create vault', async () => {
  const storage = createInMemoryVaultStorage(O.none);
  const vaults = await pipe(
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
  );

  expect(vaults).toEqual([
    {
      id: expect.any(String),
      name: 'vault name',
    },
  ]);
});

it('should rename vault', async () => {
  const defaultUser = { id: 'userId', login: 'userLogin' };
  const defaultVault = { id: 'vaultId', name: 'vault name' };

  const storage = createInMemoryVaultStorage(
    O.some({
      user: defaultUser,
      vaults: [defaultVault],
    }),
  );
  const vaults = await pipe(
    { id: defaultVault.id, name: 'new vault name' },
    renameVaultUseCase(storage),
    TE.map(constant({ userId: defaultUser.id })),
    TE.flatMap(getUserVaultsUseCase(storage)),
    promiseFromTaskEither,
  );

  expect(vaults).toEqual([
    {
      id: expect.any(String),
      name: 'new vault name',
    },
  ]);
});
