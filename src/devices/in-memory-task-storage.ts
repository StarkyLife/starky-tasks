import * as A from 'fp-ts/Array';
import { flow, constVoid, constant, pipe } from 'fp-ts/function';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/string';
import * as TE from 'fp-ts/TaskEither';
import {
  CanFindTasks,
  CanCreateTask,
  CanRemoveTask,
  CanUpdateTaskContent,
  CanGetTaskById,
  CanGetTaskContent,
  CanUpdateTask,
} from '#/application/dependencies';
import { TaskItemShort } from '#/core/data/task-item';

type InMemoryTaskStorage = CanFindTasks &
  CanGetTaskById &
  CanCreateTask &
  CanUpdateTask &
  CanRemoveTask &
  CanGetTaskContent &
  CanUpdateTaskContent;

const emptyTask: TaskItemShort = {
  id: '',
  title: '',
  isDone: false,
  parentId: O.none,
};

export const createInMemoryTaskStorage = (seed: O.Option<TaskItemShort[]>): InMemoryTaskStorage => {
  const tasksMap = pipe(
    seed,
    O.map(A.map((s): [string, TaskItemShort] => [s.id, s])),
    O.match(
      () => new Map<string, TaskItemShort>(),
      (s) => new Map<string, TaskItemShort>(s),
    ),
  );
  const contentMap = new Map<string, string>();

  return {
    findTasks: (criteria) =>
      pipe(
        TE.Do,
        TE.map(() => Array.from(tasksMap.values())),
        TE.map(A.filter(({ parentId }) => O.getEq(S.Eq).equals(parentId, criteria.parentId))),
      ),
    getTaskById: flow(
      TE.of,
      TE.flatMap((id) => pipe(tasksMap.get(id), TE.fromNullable(new Error('Not found')))),
    ),
    createTask: ({ title, parentId }) =>
      pipe(
        TE.of<Error, TaskItemShort>({
          ...emptyTask,
          id: title + '_id',
          title,
          parentId,
        }),
        TE.tap((item) => TE.of(tasksMap.set(item.id, item))),
      ),
    updateTask: ({ id, title, isDone, parentId }) =>
      pipe(
        TE.Do,
        TE.flatMap(() => pipe(tasksMap.get(id), TE.fromNullable(new Error('Not found')))),
        TE.map(
          (existing): TaskItemShort => ({
            ...existing,
            title: pipe(title, O.getOrElse(constant(existing.title))),
            isDone: pipe(isDone, O.getOrElse(constant(existing.isDone))),
            parentId: pipe(parentId, O.getOrElse(constant(existing.parentId))),
          }),
        ),
        TE.tap((item) => TE.of(tasksMap.set(item.id, item))),
      ),
    removeTask: (taskId) =>
      pipe(
        TE.Do,
        TE.map(() => tasksMap.delete(taskId)),
        TE.map(() => contentMap.delete(taskId)),
        TE.map(constVoid),
      ),
    getTaskContent: flow(
      TE.of,
      TE.map((id) => pipe(contentMap.get(id), O.fromNullable)),
    ),
    updateTaskContent: ({ id, content }) =>
      pipe(
        TE.Do,
        TE.map(() => contentMap.set(id, content)),
        TE.map(constVoid),
      ),
  };
};
