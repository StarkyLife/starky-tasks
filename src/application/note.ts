import { pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  NoteTitleUpdateData,
  NoteItemDetails,
  noteUpdateDataDefaults,
  NoteRelationUpdateData,
  NoteSearchCriteria,
  NoteItemId,
} from '#/application/lib/data/note-item';
import {
  CanUpdateNote,
  CanRemoveNote,
  CanUpdateNoteContent,
  CanGetNoteById,
  CanGetNoteContent,
  CanFindNotes,
  CanCreateNote,
  CanUpdateNotesChildrenOrder,
  CanGetNotesChildrenOrder,
} from './dependencies';
import { repositionNotesByOrder } from './lib/ordering';

/* Create */

export const addNoteUseCase = (deps: CanCreateNote) => deps.createNote;

/* Read */

export const getNotesUseCase =
  (deps: CanFindNotes & CanGetNotesChildrenOrder) => (criteria: NoteSearchCriteria) =>
    pipe(
      TE.of(repositionNotesByOrder),
      TE.ap(deps.findNotes(criteria)),
      TE.ap(deps.getNotesChildrenOrder(criteria.parentId)),
    );

export const getNoteDetailsUseCase =
  (deps: CanGetNoteById & CanGetNoteContent & CanFindNotes) => (id: NoteItemId) =>
    pipe(
      TE.Do,
      TE.bind('item', () => deps.getNoteById(id)),
      TE.bind('content', () => deps.getNoteContent(id)),
      TE.bind('children', () => deps.findNotes({ parentId: O.some(id) })),
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

export const archiveNoteUseCase = (deps: CanUpdateNote) => (id: NoteItemId) =>
  deps.updateNote({ ...noteUpdateDataDefaults, id, isArchived: O.some(true) });

export const restoreNoteUseCase = (deps: CanUpdateNote) => (id: NoteItemId) =>
  deps.updateNote({ ...noteUpdateDataDefaults, id, isArchived: O.some(false) });

export const changeNotesOrderUseCase = (deps: CanUpdateNotesChildrenOrder) =>
  deps.updateNotesChildrenOrder;

/* Delete */

export const deleteNoteUseCase = (deps: CanRemoveNote) => deps.removeNote;
