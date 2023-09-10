import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import { Errors } from 'io-ts';
import { NoteItemId, NoteItemShort } from '#/application/lib/data/note-item';

let uniqueCount = 0;

export const createDefaultNote = (
  override?: Partial<Omit<NoteItemShort, 'id'> & { id: string }>,
): E.Either<Errors, NoteItemShort> =>
  pipe(
    NoteItemId.decode(override?.id || Date.now().toString() + '_' + uniqueCount++),
    E.map(
      (id): NoteItemShort => ({
        id,
        type: override?.type || 'note',
        title: override?.title || 'random title',
        isArchived: override?.isArchived || false,
        parentId: override?.parentId || O.none,
      }),
    ),
  );
