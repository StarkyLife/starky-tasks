import * as t from 'io-ts';
import { createStringBrand } from '#/utils/brands';

export const UserId = createStringBrand('UserId');
export type UserId = t.TypeOf<typeof UserId>;

export type User = {
  id: UserId;
  login: string;
};
