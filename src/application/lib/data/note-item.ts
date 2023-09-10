import * as O from 'fp-ts/Option';
import * as t from 'io-ts';
import { createStringBrand } from '#/utils/brands';

export const NoteItemId = createStringBrand('NoteItemId');
export type NoteItemId = t.TypeOf<typeof NoteItemId>;

type NoteItemIdStruct = {
  id: NoteItemId;
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
  parentId: O.Option<NoteItemId>;
};
type NoteItemContent = {
  content: O.Option<string>;
};
type NoteItemChildren = {
  children: NoteItemShort[];
};

export type NoteItemShort = NoteItemIdStruct &
  NoteItemType &
  NoteItemTitle &
  NoteItemState &
  NoteItemRelations;
export type NoteItemDetails = NoteItemShort & NoteItemContent & NoteItemChildren;

export type NoteCreateData = NoteItemType & NoteItemTitle & NoteItemRelations;
export type NoteUpdateData = NoteItemIdStruct & {
  title: O.Option<string>;
  isArchived: O.Option<boolean>;
  parentId: O.Option<O.Option<NoteItemId>>;
};

export type NoteTitleUpdateData = NoteItemIdStruct & NoteItemTitle;
export type NoteRelationUpdateData = NoteItemIdStruct & NoteItemRelations;
export type NoteContentUpdateData = NoteItemIdStruct & {
  content: string;
};
export type NoteSearchCriteria = NoteItemRelations;
export type NoteChildrenOrderChangeData = {
  id: O.Option<NoteItemId>;
  childrenIdsInOrder: NoteItemId[];
};

export const noteUpdateDataDefaults: Omit<NoteUpdateData, 'id'> = {
  title: O.none,
  isArchived: O.none,
  parentId: O.none,
};
