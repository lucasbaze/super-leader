import { createError, errorLogger } from '@/lib/errors';
import { DBClient, Organization } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  FIND_ORGANIZATION: {
    FETCH_ERROR: createError(
      'find_organization_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error searching organizations',
      'Unable to search organizations at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    )
  }
};

export interface FindOrganizationParams {
  db: DBClient;
  userId: string;
  searchTerm?: string;
}

// Define the raw database response type
type FindOrganizationRow = Pick<Organization, 'id' | 'name' | 'url' | 'created_at'>;

export type FindOrganizationServiceResult = ServiceResponse<FindOrganizationRow[]>;

export async function findOrganizations({
  db,
  userId,
  searchTerm = ''
}: FindOrganizationParams): Promise<FindOrganizationServiceResult> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.FIND_ORGANIZATION.MISSING_USER_ID };
    }

    const query = db
      .from('organization')
      .select<string, FindOrganizationRow>(
        `
        id,
        name,
        url,
        created_at
      `
      )
      .eq('user_id', userId);

    // Apply search filters only if searchTerm is provided
    if (searchTerm) {
      const terms = searchTerm.trim().split(/\s+/);

      if (terms.length === 1) {
        // Single term - search in name OR url
        query.or(`name.ilike.%${terms[0]}%,url.ilike.%${terms[0]}%`);
      } else {
        // Multiple terms - search for exact match in name
        query.ilike('name', `%${searchTerm}%`);
      }
    }

    // Order by creation date if no search term, otherwise by name
    if (!searchTerm) {
      query.order('created_at', { ascending: false }).limit(30);
    } else {
      query.order('name', { ascending: true }).limit(50);
    }

    const { data: organizations, error } = await query;

    if (error) {
      const serviceError = ERRORS.FIND_ORGANIZATION.FETCH_ERROR;
      errorLogger.log(serviceError, { details: error });
      return { data: null, error: serviceError };
    }

    if (!organizations) {
      return { data: [], error: null };
    }

    return { data: organizations, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.FIND_ORGANIZATION.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
