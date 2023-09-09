import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import {
  NoteChildrenOrderChangeData,
  NoteContentUpdateData,
  NoteCreateData,
  NoteItemShort,
  NoteSearchCriteria,
  NoteUpdateData,
} from '#/application/lib/data/note-item';

export type CanFindNotes = {
  findNotes: (criteria: NoteSearchCriteria) => TE.TaskEither<Error, NoteItemShort[]>;
};

export type CanGetNoteById = {
  getNoteById: (id: string) => TE.TaskEither<Error, NoteItemShort>;
};

export type CanCreateNote = {
  createNote: (data: NoteCreateData) => TE.TaskEither<Error, NoteItemShort>;
};

export type CanUpdateNote = {
  updateNote: (data: NoteUpdateData) => TE.TaskEither<Error, NoteItemShort>;
};

export type CanRemoveNote = {
  removeNote: (id: string) => TE.TaskEither<Error, void>;
};

export type CanGetNoteContent = {
  getNoteContent: (taskId: string) => TE.TaskEither<Error, O.Option<string>>;
};

export type CanUpdateNoteContent = {
  updateNoteContent: (data: NoteContentUpdateData) => TE.TaskEither<Error, void>;
};

export type CanUpdateNotesChildrenOrder = {
  updateNotesChildrenOrder: (data: NoteChildrenOrderChangeData) => TE.TaskEither<Error, void>;
};

export type CanGetNotesChildrenOrder = {
  getNotesChildrenOrder: (id: O.Option<string>) => TE.TaskEither<Error, O.Option<string[]>>;
};
