export type TaskItem = {
  id: string;
  title: string;
  isDone: boolean;
};

export type TaskCreationData = {
  title: string;
};

export type TaskUpdateData = {
  id: string;
  title: string;
};
