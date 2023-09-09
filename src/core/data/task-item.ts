import * as O from 'fp-ts/Option';

export type TaskItemShort = {
  id: string;
  title: string;
  isDone: boolean;
  parentId: O.Option<string>;
};

export type TaskItemDetails = {
  id: string;
  title: string;
  content: O.Option<string>;
  isDone: boolean;
  parentId: O.Option<string>;
  tasks: TaskItemShort[];
};

export type TaskCreateData = {
  title: string;
  parentId: O.Option<string>;
};

export type TaskUpdateData = {
  id: string;
  title: O.Option<string>;
  isDone: O.Option<boolean>;
  parentId: O.Option<O.Option<string>>;
};

export type TaskTitleUpdateData = {
  id: string;
  title: string;
};

export type TaskRelationUpdateData = {
  id: string;
  parentId: O.Option<string>;
};

export type TaskContentUpdateData = {
  id: string;
  content: string;
};

export type TaskSearchCriteria = {
  parentId: O.Option<string>;
};
