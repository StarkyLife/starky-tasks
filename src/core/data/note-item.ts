import * as O from 'fp-ts/Option';

export type NoteItemShort = {
  id: string;
  title: string;
  isArchived: boolean;
};

export type NoteItemDetails = {
  id: string;
  title: string;
  content: O.Option<string>;
  isArchived: boolean;
};

export type NoteSaveData = {
  id: O.Option<string>;
  title: O.Option<string>;
  isArchived: O.Option<boolean>;
};

export type NoteUpdateData = {
  id: string;
  title: string;
};

export type NoteContentUpdateData = {
  id: string;
  content: string;
};
