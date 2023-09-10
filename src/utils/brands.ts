import * as t from 'io-ts';

type BrandedStringType<Name extends string> = t.Branded<string, { readonly [key in Name]: symbol }>;

export const createStringBrand = <Name extends string>(name: Name) =>
  t.brand(t.string, (value): value is BrandedStringType<Name> => Boolean(value), name);
