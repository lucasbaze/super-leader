import { BaseErrorType } from '@/lib/errors';

export const PERSON_ERRORS = {
  NOT_FOUND: (id: string) => ({
    name: 'person_not_found',
    type: BaseErrorType.NOT_FOUND,
    message: `The person with id: ${id} was not found`
  }),
  ALREADY_EXISTS: {
    name: 'person_already_exists',
    type: BaseErrorType.CONFLICT,
    message: 'The person you are trying to create already exists'
  },
  FETCH_ERROR: {
    name: 'person_fetch_error',
    type: BaseErrorType.DATABASE_ERROR,
    message: 'Failed to fetch people'
  }
} as const;
