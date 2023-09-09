import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  NoteTitleUpdateData,
  NoteItemDetails,
  noteUpdateDataDefaults,
  NoteRelationUpdateData,
} from '#/application/lib/data/note-item';
import {
  CanUpdateNote,
  CanRemoveNote,
  CanUpdateNoteContent,
  CanGetNoteById,
  CanGetNoteContent,
  CanFindNotes,
  CanCreateNote,
} from './dependencies';

/* Create */

export const addNoteUseCase = (deps: CanCreateNote) => deps.createNote;

/* Read */

export const getNotesUseCase = (deps: CanFindNotes) => deps.findNotes;

export const getNoteDetailsUseCase =
  (deps: CanGetNoteById & CanGetNoteContent & CanFindNotes) => (taskId: string) =>
    pipe(
      TE.Do,
      TE.bind('item', () => deps.getNoteById(taskId)),
      TE.bind('content', () => deps.getNoteContent(taskId)),
      TE.bind('children', () => deps.findNotes({ parentId: O.some(taskId) })),
      TE.map(({ item, content, children }): NoteItemDetails => ({ ...item, content, children })),
    );

/* Update */

export const editNoteContentUseCase = (deps: CanUpdateNoteContent) => deps.updateNoteContent;

export const editNoteUseCase =
  (deps: CanUpdateNote) =>
  ({ id, title }: NoteTitleUpdateData) =>
    deps.updateNote({ ...noteUpdateDataDefaults, id, title: O.some(title) });

export const moveNoteUseCase =
  (deps: CanUpdateNote) =>
  ({ id, parentId }: NoteRelationUpdateData) =>
    deps.updateNote({ ...noteUpdateDataDefaults, id, parentId: O.some(parentId) });

export const archiveNoteUseCase = (deps: CanUpdateNote) => (id: string) =>
  deps.updateNote({ ...noteUpdateDataDefaults, id, isArchived: O.some(true) });

export const restoreNoteUseCase = (deps: CanUpdateNote) => (id: string) =>
  deps.updateNote({ ...noteUpdateDataDefaults, id, isArchived: O.some(false) });

/* Delete */

export const deleteNoteUseCase = (deps: CanRemoveNote) => deps.removeNote;
