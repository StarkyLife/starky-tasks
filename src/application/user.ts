import { CanCreateUser } from './dependencies';

export const registerUserUseCase = (deps: CanCreateUser) => deps.createUser;
