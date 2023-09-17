import { constant, constVoid, pipe } from 'fp-ts/function';
import * as M from 'fp-ts/Map';
import * as S from 'fp-ts/string';
import * as TE from 'fp-ts/TaskEither';
import { NoteItemId, NoteItemShort } from '#/application/lib/data/note-item';
import { VaultId } from '#/application/lib/data/vault';

export const checkParentVault =
  (storage: Map<NoteItemId, NoteItemShort>) => (vaultId: VaultId) => (parentId: NoteItemId) =>
    pipe(
      storage,
      M.lookup(S.Eq)(parentId),
      TE.fromOption(constant(new Error('Not found'))),
      TE.flatMap(
        TE.fromPredicate(
          (p) => p.vaultId === vaultId,
          constant(new Error('Vault ids are not equal')),
        ),
      ),
      TE.map(constVoid),
    );
