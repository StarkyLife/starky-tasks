import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { constant, pipe } from 'fp-ts/function';
import * as M from 'fp-ts/Map';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/string';
import * as TE from 'fp-ts/TaskEither';
import {
  CanCreateVault,
  CanUpdateVault,
  CanCreateUser,
  CanFindVaults,
} from '#/application/dependencies';
import { User } from '#/application/lib/data/user';
import { Vault } from '#/application/lib/data/vault';

type InMemoryVaultStorage = CanCreateVault & CanUpdateVault & CanCreateUser & CanFindVaults;

export const createInMemoryVaultStorage = (
  seed: O.Option<{ user: User; vaults: Vault[] }>,
): InMemoryVaultStorage => {
  const vaultsMap = pipe(
    seed,
    O.map((s) => s.vaults),
    O.map(A.map((v): [string, Vault] => [v.id, v])),
    O.match(
      () => new Map<string, Vault>(),
      (v) => new Map<string, Vault>(v),
    ),
  );
  const usersMap = pipe(
    seed,
    O.map((s) => [s.user]),
    O.map(A.map((u): [string, User] => [u.id, u])),
    O.match(
      () => new Map<string, User>(),
      (u) => new Map<string, User>(u),
    ),
  );
  const usersVaultsMap = pipe(
    seed,
    O.map((s): Array<[string, string[]]> => [[s.user.id, s.vaults.map((v) => v.id)]]),
    O.match(
      () => new Map<string, string[]>(),
      (u) => new Map<string, string[]>(u),
    ),
  );

  return {
    createUser: (login) =>
      pipe(
        TE.of({ id: Date.now().toString(), login }),
        TE.tap((u) => TE.of(usersMap.set(u.id, u))),
      ),
    findVaults: ({ userId }) =>
      pipe(
        TE.Do,
        TE.flatMapEither(() =>
          pipe(
            usersMap,
            M.lookup(S.Eq)(userId),
            E.fromOption(constant(new Error('User not found'))),
          ),
        ),
        TE.map((user) =>
          pipe(
            usersVaultsMap,
            M.lookup(S.Eq)(user.id),
            O.map(A.filterMap((vaultId) => pipe(vaultsMap, M.lookup(S.Eq)(vaultId)))),
            O.getOrElse((): Vault[] => []),
          ),
        ),
      ),
    createVault: ({ name, creatorId }) =>
      pipe(
        TE.of({ id: Date.now().toString(), name }),
        TE.tap((v) => TE.of(vaultsMap.set(v.id, v))),
        TE.tapEither((vault) =>
          pipe(
            usersMap,
            M.lookup(S.Eq)(creatorId),
            E.fromOption(constant(new Error('User not found'))),
            E.map((creator) =>
              pipe(
                usersVaultsMap,
                M.lookup(S.Eq)(creator.id),
                O.map(A.concat([vault.id])),
                O.getOrElse(constant([vault.id])),
                (vaultIds) => usersVaultsMap.set(creator.id, vaultIds),
              ),
            ),
          ),
        ),
      ),
    updateVault: ({ id, name }) =>
      pipe(
        TE.Do,
        TE.flatMap(() => pipe(vaultsMap.get(id), TE.fromNullable(new Error('Not found')))),
        TE.map(
          (existing): Vault => ({
            ...existing,
            name: pipe(name, O.getOrElse(constant(existing.name))),
          }),
        ),
        TE.tap((item) => TE.of(vaultsMap.set(item.id, item))),
      ),
  };
};
