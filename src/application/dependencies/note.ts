import * as TE from 'fp-ts/TaskEither';
import { NoteItemShort, NoteSaveData } from '#/core/data/note-item';

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
