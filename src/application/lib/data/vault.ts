import * as O from 'fp-ts/Option';

export type Vault = {
  id: string;
  name: string;
};

export type VaultCreateData = {
  name: string;
  creatorId: string;
};

export type VaultUpdateData = {
  id: string;
  name: O.Option<string>;
};

export type VaultSearchCriteria = {
  userId: string;
};

export type VaultNameUpdateData = {
  id: string;
  name: string;
};
