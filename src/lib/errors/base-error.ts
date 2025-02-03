export enum BaseErrorType {
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  CONFLICT = 'CONFLICT',
  BAD_REQUEST = 'BAD_REQUEST',
  FORBIDDEN = 'FORBIDDEN',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  TIMEOUT = 'TIMEOUT'
}

export type TBaseError = {
  name: string;
  type: keyof typeof BaseErrorType;
  message: string;
  details?: unknown;
};

export class BaseException extends Error {
  public readonly type: keyof typeof BaseErrorType;
  public readonly details?: unknown;
  public readonly name: string;

  constructor(error: Omit<TBaseError, 'details'>, details?: unknown) {
    super(error.message);
    this.name = error.name;
    this.type = error.type;
    this.details = details;
  }
}
