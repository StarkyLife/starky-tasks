import * as O from 'fp-ts/Option';

type NoteItemId = {
  id: string;
};
type NoteItemType = {
  type: 'task' | 'note';
};
type NoteItemTitle = {
  title: string;
};
type NoteItemState = {
  isArchived: boolean;
};
type NoteItemRelations = {
  parentId: O.Option<string>;
};
type NoteItemContent = {
  content: O.Option<string>;
};
type NoteItemChildren = {
  children: NoteItemShort[];
};

export type NoteItemShort = NoteItemId &
  NoteItemType &
  NoteItemTitle &
  NoteItemState &
  NoteItemRelations;
export type NoteItemDetails = NoteItemShort & NoteItemContent & NoteItemChildren;

export type NoteCreateData = NoteItemType & NoteItemTitle & NoteItemRelations;
export type NoteUpdateData = NoteItemId & {
  title: O.Option<string>;
  isArchived: O.Option<boolean>;
  parentId: O.Option<O.Option<string>>;
};

export type NoteTitleUpdateData = NoteItemId & NoteItemTitle;
export type NoteRelationUpdateData = NoteItemId & NoteItemRelations;
export type NoteContentUpdateData = NoteItemId & {
  content: string;
};
export type NoteSearchCriteria = NoteItemRelations;
export type NoteChildrenOrderChangeData = {
  id: O.Option<string>;
  childrenIdsInOrder: string[];
};

export const noteUpdateDataDefaults: Omit<NoteUpdateData, 'id'> = {
  title: O.none,
  isArchived: O.none,
  parentId: O.none,
};
