export type TaskItemShort = {
  id: string;
  title: string;
  isDone: boolean;
};

export type TaskItemDetails = {
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
  title: string;
};

export type TaskNotesUpdateData = {
  id: string;
  notes: string;
};

export type TaskStateUpdateData = {
  id: string;
  isDone: boolean;
};
