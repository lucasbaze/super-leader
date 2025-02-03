import { TError } from './errors';
import { Nullable } from './utils';

export type TServiceResponse<T> = {
  data: Nullable<T>;
  error: Nullable<TError>;
};
