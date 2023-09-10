import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import { Errors } from 'io-ts';
import { Vault, VaultId } from '#/application/lib/data/vault';

let uniqueCount = 0;

export const createDefaultVault = (override?: Partial<Vault>): E.Either<Errors, Vault> =>
  pipe(
    VaultId.decode(Date.now().toString() + '_' + uniqueCount++),
    E.map((id): Vault => ({ id, name: 'vault name', ...override })),
  );
