import { SuperError } from './errors';

export type ApiResponse<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: SuperError };
