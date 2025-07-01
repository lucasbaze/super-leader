export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Maybe<T> = T | null | undefined;

export type RecursiveNonNullable<T> = {
  [K in keyof T]: RecursiveNonNullable<NonNullable<T[K]>>;
};
