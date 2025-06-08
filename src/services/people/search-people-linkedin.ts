import { createError } from '@/lib/errors/error-factory';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient, Person, Website } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  SEARCH: {
    FETCH_ERROR: createError(
      'search_people_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error searching for person',
      'Unable to search for person at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    ),
    MISSING_SEARCH_PARAMS: createError(
      'missing_search_params',
      ErrorType.VALIDATION_ERROR,
      'Both name combination and LinkedIn ID are required',
      'Please provide both full name and LinkedIn ID to search'
    ),
    WEBSITES_ERROR: createError(
      'websites_error',
      ErrorType.DATABASE_ERROR,
      'Failed to fetch websites',
      'Unable to load website information'
    )
  }
};

export interface SearchPersonParams {
  db: DBClient;
  userId: string;
  firstName: string;
  lastName: string;
  linkedinPublicId: string;
}

export interface SearchPersonResult {
  person: Person;
  websites?: Website[];
}

export async function searchPerson({
  db,
  userId,
  firstName,
  lastName,
  linkedinPublicId
}: SearchPersonParams): Promise<ServiceResponse<SearchPersonResult>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.SEARCH.MISSING_USER_ID };
    }

    // Validate that we have both name combination and LinkedIn ID
    if (!firstName || !lastName || !linkedinPublicId) {
      return { data: null, error: ERRORS.SEARCH.MISSING_SEARCH_PARAMS };
    }

    // Use PostgREST's built-in parameter binding
    const { data: person, error } = await db
      .from('person')
      .select('*')
      .eq('user_id', userId)
      .or(`and(first_name.eq."${firstName}",last_name.eq."${lastName}"),linkedin_public_id.eq."${linkedinPublicId}"`)
      .limit(1);

    if (error) {
      const serviceError = {
        ...ERRORS.SEARCH.FETCH_ERROR,
        details: error
      };
      errorLogger.log(serviceError);
      return { data: null, error: serviceError };
    }

    // Return null if no person found
    if (!person?.[0]) {
      return { data: null, error: null };
    }

    // Get websites for the found person
    const { data: websites, error: websitesError } = await db
      .from('websites')
      .select('*')
      .eq('person_id', person[0].id);

    if (websitesError) {
      const error = { ...ERRORS.SEARCH.WEBSITES_ERROR, details: websitesError };
      errorLogger.log(error);
      return { data: null, error };
    }

    // Return person with their websites
    return {
      data: {
        person: person[0],
        websites: websites || []
      },
      error: null
    };
  } catch (error) {
    const serviceError = {
      ...ERRORS.SEARCH.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
