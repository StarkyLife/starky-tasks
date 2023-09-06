import * as A from 'fp-ts/Array';
import { constVoid, constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  CanFindFolders,
  CanGetFolderById,
  CanRemoveFolder,
  CanSaveFolder,
} from '#/application/dependencies';
import { FolderItemShort } from '#/core/data/folder-item';

type InMemoryFolderStorage = CanFindFolders & CanGetFolderById & CanSaveFolder & CanRemoveFolder;

export const createInMemoryFolderStorage = (
  seed: O.Option<FolderItemShort[]>,
): InMemoryFolderStorage => {
  const foldersMap = pipe(
    seed,
    O.map(A.map((s): [string, FolderItemShort] => [s.id, s])),
    O.match(
      () => new Map<string, FolderItemShort>(),
      (s) => new Map<string, FolderItemShort>(s),
    ),
  );

  return {
    findFolders: () => TE.of(Array.from(foldersMap.values())),
    getFolderById: (id) => pipe(foldersMap.get(id), TE.fromNullable(new Error('Not found'))),
    saveFolder: (data) =>
      pipe(
        data.id,
        O.flatMap((id) => pipe(foldersMap.get(id), O.fromNullable)),
        O.getOrElse(
          constant<FolderItemShort>({ id: data.name + '_id', name: '', isArchived: false }),
        ),
        (existing) =>
          TE.of<Error, FolderItemShort>({
            ...existing,
            name: pipe(data.name, O.getOrElse(constant(existing.name))),
            isArchived: pipe(data.isArchived, O.getOrElse(constant(existing.isArchived))),
          }),
        TE.tap((item) => TE.of(foldersMap.set(item.id, item))),
      ),
    removeFolder: (id) => pipe(TE.of(foldersMap.delete(id)), TE.map(constVoid)),
  };
};
