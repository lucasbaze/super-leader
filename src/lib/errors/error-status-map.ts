import { BaseErrorType } from './base-error';

export const errorStatusMap: Record<keyof typeof BaseErrorType, number> = {
  [BaseErrorType.NOT_FOUND]: 404,
  [BaseErrorType.UNAUTHORIZED]: 401,
  [BaseErrorType.VALIDATION_ERROR]: 400,
  [BaseErrorType.DATABASE_ERROR]: 503,
  [BaseErrorType.INTERNAL_ERROR]: 500,
  [BaseErrorType.CONFLICT]: 409,
  [BaseErrorType.BAD_REQUEST]: 400,
  [BaseErrorType.FORBIDDEN]: 403,
  [BaseErrorType.UNKNOWN_ERROR]: 500,
  [BaseErrorType.TIMEOUT]: 408
};
