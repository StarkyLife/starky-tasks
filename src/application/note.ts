import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { NoteUpdateData, NoteItemDetails } from '#/core/data/note-item';
import {
  CanSaveNote,
  CanRemoveNote,
  CanUpdateNoteContent,
  CanGetNoteById,
  CanGetNoteContent,
  CanFindNotes,
} from './dependencies';

/* Create */

export const addNoteUseCase = (deps: CanSaveNote) => (title: string) =>
  deps.saveNote({ id: O.none, title: O.some(title), isArchived: O.some(false) });

/* Read */

export const getNotesUseCase = (deps: CanFindNotes) => deps.findNotes;
export const getNoteDetailsUseCase =
  (deps: CanGetNoteById & CanGetNoteContent) => (taskId: string) =>
    pipe(
      TE.Do,
      TE.bind('item', () => deps.getNoteById(taskId)),
      TE.bind('content', () => deps.getNoteContent(taskId)),
      TE.map(({ item, content }): NoteItemDetails => ({ ...item, content })),
    );
/* Update */

export const editNoteUseCase =
  (deps: CanSaveNote) =>
  ({ id, title }: NoteUpdateData) =>
    deps.saveNote({ id: O.some(id), title: O.some(title), isArchived: O.none });
export const editNoteContentUseCase = (deps: CanUpdateNoteContent) => deps.updateNoteContent;
export const archiveNoteUseCase = (deps: CanSaveNote) => (id: string) =>
  deps.saveNote({ id: O.some(id), title: O.none, isArchived: O.some(true) });
export const restoreNoteUseCase = (deps: CanSaveNote) => (id: string) =>
  deps.saveNote({ id: O.some(id), title: O.none, isArchived: O.some(false) });

/* Delete */

export const deleteNoteUseCase = (deps: CanRemoveNote) => deps.removeNote;
