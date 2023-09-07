import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';
import { NoteItemDetails } from '#/core/data/note-item';
import { CanGetNoteById, CanGetNoteContent } from '../dependencies';

export const getNoteDetailsUseCase =
  (deps: CanGetNoteById & CanGetNoteContent) => (taskId: string) =>
    pipe(
      TE.Do,
      TE.bind('item', () => deps.getNoteById(taskId)),
      TE.bind('content', () => deps.getNoteContent(taskId)),
      TE.map(({ item, content }): NoteItemDetails => ({ ...item, content })),
    );
