import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { NoteItemShort, NoteItemId } from '#/application/lib/data/note-item';
import { User, UserId } from '#/application/lib/data/user';
import { Vault, VaultId } from '#/application/lib/data/vault';

export const initVaultStorage = (seed: O.Option<{ user: User; vaults: Vault[] }>) => ({
  vaultsData: pipe(
    seed,
    O.map((s) => s.vaults),
    O.map(A.map((v): [VaultId, Vault] => [v.id, v])),
    O.match(
      () => new Map<VaultId, Vault>(),
      (v) => new Map<VaultId, Vault>(v),
    ),
  ),
  usersData: pipe(
    seed,
    O.map((s) => [s.user]),
    O.map(A.map((u): [UserId, User] => [u.id, u])),
    O.match(
      () => new Map<UserId, User>(),
      (u) => new Map<UserId, User>(u),
    ),
  ),
  userVaultRelation: pipe(
    seed,
    O.map((s): Array<[UserId, VaultId[]]> => [[s.user.id, s.vaults.map((v) => v.id)]]),
    O.match(
      () => new Map<UserId, VaultId[]>(),
      (u) => new Map<UserId, VaultId[]>(u),
    ),
  ),
});

export const initNoteStorage = (seed: O.Option<NoteItemShort[]>) => ({
  data: pipe(
    seed,
    O.map(A.map((s): [NoteItemId, NoteItemShort] => [s.id, s])),
    O.match(
      () => new Map<NoteItemId, NoteItemShort>(),
      (s) => new Map<NoteItemId, NoteItemShort>(s),
    ),
  ),
});

export const initContentStorage = () => ({
  data: new Map<NoteItemId, string>(),
});

export const initOrderStorage = () => ({
  parentlessNotesOrderId: Symbol(),
  data: new Map<NoteItemId | symbol, NoteItemId[]>(),
});
