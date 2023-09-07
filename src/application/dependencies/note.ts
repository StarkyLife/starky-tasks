import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { NoteContentUpdateData, NoteItemShort, NoteSaveData } from '#/core/data/note-item';

export type CanFindNotes = {
  findNotes: () => TE.TaskEither<Error, NoteItemShort[]>;
};

export type CanSaveNote = {
  saveNote: (data: NoteSaveData) => TE.TaskEither<Error, NoteItemShort>;
};

export type CanGetNoteById = {
  getNoteById: (id: string) => TE.TaskEither<Error, NoteItemShort>;
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
