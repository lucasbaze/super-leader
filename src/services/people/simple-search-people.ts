import { createError, errorLogger } from '@/lib/errors';
import { SimpleSearchPeopleResult } from '@/types/custom';
import { DBClient, Group, Person } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export const ERRORS = {
  SEARCH_PEOPLE: {
    FETCH_ERROR: createError(
      'search_people_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error searching people',
      'Unable to search people at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    )
  }
};

export interface SearchPeopleParams {
  db: DBClient;
  userId: string;
  searchTerm?: string;
}

// Define the raw database response type
type DatabasePerson = Pick<Person, 'id' | 'first_name' | 'last_name' | 'bio' | 'ai_summary'> & {
  groups: {
    group: Pick<Group, 'id' | 'name' | 'icon' | 'slug'>;
  }[];
};

export async function simpleSearchPeople({
  db,
  userId,
  searchTerm = ''
}: SearchPeopleParams): Promise<TServiceResponse<SimpleSearchPeopleResult[]>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.SEARCH_PEOPLE.MISSING_USER_ID };
    }

    const query = db
      .from('person')
      .select<string, DatabasePerson>(
        `
        id,
        first_name,
        last_name,
        bio,
        ai_summary,
        groups:group_member(
          group(id, name, icon, slug)
        )
      `
      )
      .eq('user_id', userId);

    // Apply search filters only if searchTerm is provided
    if (searchTerm) {
      query.or(
        `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%`
      );
    }

    // Order by creation date if no search term, otherwise by name
    if (!searchTerm) {
      query.order('created_at', { ascending: false }).limit(30);
    } else {
      query.order('first_name', { ascending: true }).limit(50);
    }

    const { data: people, error } = await query;

    if (error) {
      const serviceError = ERRORS.SEARCH_PEOPLE.FETCH_ERROR;
      errorLogger.log(serviceError, { details: error });
      return { data: null, error: serviceError };
    }

    if (!people) {
      return { data: [], error: null };
    }

    // Transform the response to match our expected format
    const formattedPeople: SimpleSearchPeopleResult[] = people.map((person) => ({
      ...person,
      groups: person.groups.map((g) => ({
        id: g.group.id,
        name: g.group.name,
        icon: g.group.icon,
        slug: g.group.slug
      }))
    }));

    return { data: formattedPeople, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.SEARCH_PEOPLE.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
