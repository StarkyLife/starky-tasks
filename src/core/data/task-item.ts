import * as O from 'fp-ts/Option';

export type TaskItemShort = {
  id: string;
  title: string;
  isDone: boolean;
};

export type TaskItemDetails = {
  id: string;
  title: string;
  notes: O.Option<string>;
  isDone: boolean;
};

export type TaskSaveData = {
  id: O.Option<string>;
  title: O.Option<string>;
  isDone: O.Option<boolean>;
};

export type TaskUpdateData = {
  id: string;
  title: string;
};

export type TaskNotesUpdateData = {
  id: string;
  notes: string;
};
