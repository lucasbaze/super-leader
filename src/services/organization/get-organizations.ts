import { createError } from '@/lib/errors/error-factory';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient, Organization } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  ORGANIZATIONS: {
    FETCH_ERROR: createError(
      'organizations_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching organizations data',
      'Unable to load your organizations at this time'
    )
  }
};

export interface GetOrganizationsParams {
  db: DBClient;
  userId: string;
}

export async function getOrganizations({
  db,
  userId
}: GetOrganizationsParams): Promise<ServiceResponse<Organization[]>> {
  try {
    const { data: organizations, error } = await db
      .from('organization')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      const serviceError = ERRORS.ORGANIZATIONS.FETCH_ERROR;
      errorLogger.log(serviceError, { details: error });

      return { data: null, error: serviceError };
    }

    return { data: organizations, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.ORGANIZATIONS.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);

    return { data: null, error: serviceError };
  }
}
