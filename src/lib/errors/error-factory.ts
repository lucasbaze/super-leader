import { ErrorType, TError } from '@/types/errors';

export const createError = (
  name: string,
  type: ErrorType,
  message: string,
  displayMessage?: string,
  details?: unknown
): TError => {
  const error = new Error(message) as TError;
  error.name = name;
  error.type = type;
  error.displayMessage = displayMessage;
  error.details = details;

  return error;
};

export const toError = (error: unknown): TError => {
  if (error instanceof Error) {
    return createError(
      error.name || 'unknown_error',
      ErrorType.INTERNAL_ERROR,
      error.message || 'An unexpected error occurred',
      'Something went wrong. Please try again.',
      error
    );
  }

  return createError(
    'unknown_error',
    ErrorType.INTERNAL_ERROR,
    'An unexpected error occurred',
    'Something went wrong. Please try again.',
    error
  );
};
