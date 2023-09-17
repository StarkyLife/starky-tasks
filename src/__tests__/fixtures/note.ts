import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { Errors } from 'io-ts';
import { NoteItemId, NoteItemShort } from '#/application/lib/data/note-item';
import { VaultId } from '#/application/lib/data/vault';

let uniqueCount = 0;

export const createDefaultNote = (
  override?: Partial<Omit<NoteItemShort, 'id' | 'vaultId'> & { id: string; vaultId: string }>,
): E.Either<Errors, NoteItemShort> =>
  pipe(
    E.Do,
    E.bind('noteId', () =>
      NoteItemId.decode(override?.id || Date.now().toString() + '_' + uniqueCount++),
    ),
    E.bind('vaultId', () => VaultId.decode(override?.vaultId || 'vaultId')),
    E.map(
      ({ noteId, vaultId }): NoteItemShort => ({
        id: noteId,
        type: override?.type || 'note',
        title: override?.title || 'random title',
        isArchived: override?.isArchived || false,
        parentId: override?.parentId || O.none,
        vaultId,
      }),
    ),
  );
