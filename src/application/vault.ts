import * as O from 'fp-ts/Option';
import { CanCreateVault, CanFindVaults, CanUpdateVault } from './dependencies';
import { VaultNameUpdateData } from './lib/data/vault';

export const addVaultUseCase = (deps: CanCreateVault) => deps.createVault;
export const getUserVaultsUseCase = (deps: CanFindVaults) => deps.findVaults;
export const renameVaultUseCase =
  (deps: CanUpdateVault) =>
  ({ id, name }: VaultNameUpdateData) =>
    deps.updateVault({ id, name: O.some(name) });
