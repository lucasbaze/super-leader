import { TError } from './errors';

// import { ServiceResponse } from './service-response';

export type ApiResponse<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: TError };
