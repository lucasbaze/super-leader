import { createError } from '@/lib/errors/error-factory';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient, Person } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export const ERRORS = {
  PEOPLE: {
    FETCH_ERROR: createError(
      'people_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching people data',
      'Unable to load your people at this time'
    )
  }
};

export interface GetPeopleParams {
  db: DBClient;
  userId: string;
}

export async function getPeople({
  db,
  userId
}: GetPeopleParams): Promise<TServiceResponse<Person[]>> {
  try {
    const { data: people, error } = await db
      .from('person')
      .select('*')
      .eq('user_id', userId)
      .order('first_name', { ascending: true });

    if (error) {
      const serviceError = ERRORS.PEOPLE.FETCH_ERROR;
      errorLogger.log(serviceError, { details: error });

      return { data: null, error: serviceError };
    }

    return { data: people, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.PEOPLE.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);

    return { data: null, error: serviceError };
  }
}
