import { SuperError } from './errors';
import { Nullable } from './utils';

export type ServiceResponse<T> = {
  data: Nullable<T>;
  error: Nullable<SuperError>;
};
