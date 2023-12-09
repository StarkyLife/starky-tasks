import * as A from 'fp-ts/Array';
import * as E from 'fp-ts/Either';
import { flow, constVoid, constant, pipe } from 'fp-ts/function';
import * as IO from 'fp-ts/IO';
import * as M from 'fp-ts/Map';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/string';
import * as TE from 'fp-ts/TaskEither';
import {
  CanCreateNote,
  CanCreateUser,
  CanCreateVault,
  CanFindNotes,
  CanFindVaults,
  CanGetNoteById,
  CanGetNoteContent,
  CanGetNotesChildrenOrder,
  CanRemoveNote,
  CanRemoveVault,
  CanUpdateNote,
  CanUpdateNoteContent,
  CanUpdateNotesChildrenOrder,
  CanUpdateVault,
} from '#/application/dependencies';
import { NoteItemId, NoteItemShort } from '#/application/lib/data/note-item';
import { User, UserId } from '#/application/lib/data/user';
import { Vault, VaultId } from '#/application/lib/data/vault';
import {
  initContentStorage,
  initNoteStorage,
  initOrderStorage,
  initVaultStorage,
} from './lib/seeds';
import { checkParentVault } from './lib/vault-check';

type InMemoryStorage = CanCreateVault &
  CanUpdateVault &
  CanCreateUser &
  CanFindVaults &
  CanRemoveVault &
  CanFindNotes &
  CanGetNoteById &
  CanCreateNote &
  CanUpdateNote &
  CanRemoveNote &
  CanGetNoteContent &
  CanUpdateNoteContent &
  CanUpdateNotesChildrenOrder &
  CanGetNotesChildrenOrder;

export const createInMemoryRepository = (
  vaultSeed: O.Option<{ user: User; vaults: Vault[] }>,
  noteSeed: O.Option<NoteItemShort[]>,
): InMemoryStorage => {
  const vaultStorage = initVaultStorage(vaultSeed);
  const noteStorage = initNoteStorage(noteSeed);
  const contentStorage = initContentStorage();
  const orderStorage = initOrderStorage();

  const clearNoteData = (noteId: NoteItemId): TE.TaskEither<Error, void> =>
    pipe(
      TE.Do,
      TE.tapIO(() => IO.of(noteStorage.data.delete(noteId))),
      TE.tapIO(() => IO.of(contentStorage.data.delete(noteId))),
      TE.tapIO(() => IO.of(orderStorage.data.delete(noteId))),
      TE.map(constVoid),
    );

  const removeNoteCascade = (noteId: NoteItemId): TE.TaskEither<Error, void> =>
    pipe(
      clearNoteData(noteId),
      TE.tap(() =>
        pipe(
          Array.from(noteStorage.data.values()),
          A.filter(({ parentId }) => O.getEq(S.Eq).equals(parentId, O.some(noteId))),
          A.map(({ id }) => id),
          A.map(removeNoteCascade),
          A.sequence(TE.ApplicativeSeq),
        ),
      ),
    );

  return {
    createUser: (login) =>
      pipe(
        TE.Do,
        TE.flatMapEither(() =>
          pipe(
            UserId.decode(Date.now().toString() + '_' + login),
            E.mapLeft(constant(new Error('User Id creation error'))),
          ),
        ),
        TE.map((id) => ({ id, login })),
        TE.tap((u) => TE.of(vaultStorage.usersData.set(u.id, u))),
      ),
    findVaults: ({ userId }) =>
      pipe(
        TE.Do,
        TE.flatMap(() =>
          pipe(
            vaultStorage.usersData,
            M.lookup(S.Eq)(userId),
            TE.fromOption(constant(new Error('User not found'))),
          ),
        ),
        TE.map((user) =>
          pipe(
            vaultStorage.userVaultRelation,
            M.lookup(S.Eq)(user.id),
            O.map(A.filterMap((vaultId) => pipe(vaultStorage.vaultsData, M.lookup(S.Eq)(vaultId)))),
            O.getOrElse((): Vault[] => []),
          ),
        ),
      ),
    createVault: ({ name, creatorId }) =>
      pipe(
        TE.Do,
        TE.flatMapEither(() =>
          pipe(
            VaultId.decode(Date.now().toString() + '_' + name),
            E.mapLeft(constant(new Error('Vault Id creation error'))),
          ),
        ),
        TE.map((id) => ({ id, name })),
        TE.tap((v) => TE.of(vaultStorage.vaultsData.set(v.id, v))),
        TE.tap((vault) =>
          pipe(
            vaultStorage.usersData,
            M.lookup(S.Eq)(creatorId),
            TE.fromOption(constant(new Error('User not found'))),
            TE.map((creator) =>
              pipe(
                vaultStorage.userVaultRelation,
                M.lookup(S.Eq)(creator.id),
                O.map(A.concat([vault.id])),
                O.getOrElse(constant([vault.id])),
                (vaultIds) => vaultStorage.userVaultRelation.set(creator.id, vaultIds),
              ),
            ),
          ),
        ),
      ),
    updateVault: ({ id, name }) =>
      pipe(
        TE.Do,
        TE.flatMap(() =>
          pipe(vaultStorage.vaultsData.get(id), TE.fromNullable(new Error('Not found'))),
        ),
        TE.map(
          (existing): Vault => ({
            ...existing,
            name: pipe(name, O.getOrElse(constant(existing.name))),
          }),
        ),
        TE.tap((item) => TE.of(vaultStorage.vaultsData.set(item.id, item))),
      ),
    removeVault: (id) =>
      pipe(
        TE.Do,
        TE.tapIO(() => IO.of(vaultStorage.vaultsData.delete(id))),
        TE.tapIO(() =>
          IO.of(
            pipe(
              Array.from(vaultStorage.userVaultRelation.entries()),
              A.findFirst(([, vaultIds]) => vaultIds.includes(id)),
              O.map(([userId, vaultIds]) =>
                pipe(
                  vaultIds,
                  A.filter((existingId) => existingId !== id),
                  (newVaultIds) => vaultStorage.userVaultRelation.set(userId, newVaultIds),
                  constVoid,
                ),
              ),
              O.getOrElse(constVoid),
            ),
          ),
        ),
        TE.tap(() =>
          pipe(
            Array.from(noteStorage.data.values()),
            A.filter(({ vaultId }) => S.Eq.equals(vaultId, id)),
            A.map(({ id }) => id),
            A.map(clearNoteData),
            A.sequence(TE.ApplicativeSeq),
          ),
        ),
        TE.map(constVoid),
      ),
    findNotes: (criteria) =>
      pipe(
        TE.Do,
        TE.map(() => Array.from(noteStorage.data.values())),
        TE.map(A.filter(({ parentId }) => O.getEq(S.Eq).equals(parentId, criteria.parentId))),
      ),
    getNoteById: flow(
      TE.of,
      TE.flatMap((id) => pipe(noteStorage.data.get(id), TE.fromNullable(new Error('Not found')))),
    ),
    createNote: ({ type, title, parentId, vaultId }) =>
      pipe(
        TE.Do,
        TE.tap(() =>
          pipe(
            parentId,
            O.map(checkParentVault(noteStorage.data)(vaultId)),
            O.getOrElse(constant(TE.right(constVoid()))),
          ),
        ),
        TE.flatMapEither(() =>
          pipe(
            NoteItemId.decode(Date.now().toString() + '_' + title),
            E.mapLeft(constant(new Error('Note Id creation error'))),
          ),
        ),
        TE.map((id) => ({
          id,
          type,
          title,
          parentId,
          vaultId,
          isArchived: false,
        })),
        TE.tap((item) => TE.of(noteStorage.data.set(item.id, item))),
      ),
    updateNote: ({ id, type, title, isArchived, parentId }) =>
      pipe(
        TE.Do,
        TE.flatMap(() => pipe(noteStorage.data.get(id), TE.fromNullable(new Error('Not found')))),
        TE.tap((note) =>
          pipe(
            O.flatten(parentId),
            O.map(checkParentVault(noteStorage.data)(note.vaultId)),
            O.getOrElse(constant(TE.right(constVoid()))),
          ),
        ),
        TE.map(
          (existing): NoteItemShort => ({
            ...existing,
            type: pipe(type, O.getOrElse(constant(existing.type))),
            title: pipe(title, O.getOrElse(constant(existing.title))),
            isArchived: pipe(isArchived, O.getOrElse(constant(existing.isArchived))),
            parentId: pipe(parentId, O.getOrElse(constant(existing.parentId))),
          }),
        ),
        TE.tap((item) => TE.of(noteStorage.data.set(item.id, item))),
      ),
    removeNote: removeNoteCascade,
    getNoteContent: flow(
      TE.of,
      TE.map((id) => pipe(contentStorage.data.get(id), O.fromNullable)),
    ),
    updateNoteContent: ({ id, content }) =>
      pipe(
        TE.Do,
        TE.map(() => contentStorage.data.set(id, content)),
        TE.map(constVoid),
      ),
    updateNotesChildrenOrder: (data) =>
      pipe(
        data.id,
        O.getOrElseW(constant(orderStorage.parentlessNotesOrderId)),
        TE.of,
        TE.map((id) => orderStorage.data.set(id, data.childrenIdsInOrder)),
        TE.map(constVoid),
      ),
    getNotesChildrenOrder: (id) =>
      pipe(
        id,
        O.getOrElseW(constant(orderStorage.parentlessNotesOrderId)),
        TE.of,
        TE.map((orderId) => pipe(orderStorage.data.get(orderId), O.fromNullable)),
      ),
  };
};
