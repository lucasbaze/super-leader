import { createError } from '@/lib/errors/error-factory';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient, Organization, Person } from '@/types/database';
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

// Define the raw database response type with nested people
type OrganizationWithPeople = Organization & {
  people: {
    person: Pick<Person, 'id' | 'first_name' | 'last_name'>;
  }[];
};

export type GetOrganizationsResult = Organization & {
  people: Pick<Person, 'id' | 'first_name' | 'last_name'>[];
};

export async function getOrganizations({
  db,
  userId
}: GetOrganizationsParams): Promise<ServiceResponse<GetOrganizationsResult[]>> {
  try {
    const { data: organizations, error } = await db
      .from('organization')
      .select<string, OrganizationWithPeople>(
        `
        *,
        people:person_organization(
          person(
            id,
            first_name,
            last_name
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) {
      const serviceError = ERRORS.ORGANIZATIONS.FETCH_ERROR;
      errorLogger.log(serviceError, { details: error });

      return { data: null, error: serviceError };
    }

    if (!organizations) {
      return { data: [], error: null };
    }

    // Transform the response to flatten the people array
    const transformedOrganizations: GetOrganizationsResult[] = organizations.map((org) => ({
      ...org,
      people: org.people.map((p) => p.person)
    }));

    return { data: transformedOrganizations, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.ORGANIZATIONS.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);

    return { data: null, error: serviceError };
  }
}
