import { Nullable } from './utils';

export enum ServiceErrorType {
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface ServiceError {
  type: ServiceErrorType;
  message: string;
  details?: unknown;
}

export interface ServiceResponse<T> {
  data?: Nullable<T>;
  error?: ServiceError;
}

export class ServiceException extends Error {
  constructor(
    public readonly type: ServiceErrorType,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ServiceException';
  }
}
