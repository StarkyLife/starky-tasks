import * as O from 'fp-ts/Option';
import * as t from 'io-ts';
import { createStringBrand } from '#/utils/brands';
import { UserId } from './user';

export const VaultId = createStringBrand('VaultId');
export type VaultId = t.TypeOf<typeof VaultId>;

export type Vault = {
  id: VaultId;
  name: string;
};

export type VaultCreateData = {
  name: string;
  creatorId: UserId;
};

export type VaultUpdateData = {
  id: VaultId;
  name: O.Option<string>;
};

export type VaultSearchCriteria = {
  userId: UserId;
};

export type VaultNameUpdateData = {
  id: VaultId;
  name: string;
};
