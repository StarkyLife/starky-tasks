import * as TE from 'fp-ts/TaskEither';
import {
  VaultCreateData,
  Vault,
  VaultUpdateData,
  VaultSearchCriteria,
  VaultId,
} from '../lib/data/vault';

export type CanCreateVault = {
  createVault: (data: VaultCreateData) => TE.TaskEither<Error, Vault>;
};

export type CanUpdateVault = {
  updateVault: (data: VaultUpdateData) => TE.TaskEither<Error, Vault>;
};

export type CanFindVaults = {
  findVaults: (criteria: VaultSearchCriteria) => TE.TaskEither<Error, Vault[]>;
};

export type CanRemoveVault = {
  removeVault: (id: VaultId) => TE.TaskEither<Error, void>;
};
