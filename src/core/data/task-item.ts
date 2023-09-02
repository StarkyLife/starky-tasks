import * as O from 'fp-ts/Option';

export type TaskItem = {
  id: string;
  title: string;
  notes: string;
  isDone: boolean;
};

export type TaskCreationData = {
  title: string;
};

export type TaskUpdateData = {
  id: string;
  title: O.Option<string>;
  notes: O.Option<string>;
};
