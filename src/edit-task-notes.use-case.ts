import { CanUpdateTaskNotes } from './dependencies';

export const editTaskNotesUseCase = (deps: CanUpdateTaskNotes) => deps.updateTaskNotes;
