import { DBClient, Person } from '@/types/database';
import { ServiceErrorType, ServiceException, ServiceResponse } from '@/types/service-response';

export interface GetPeopleParams {
  db: DBClient;
  userId: string;
}

export async function getPeople({
  db,
  userId
}: GetPeopleParams): Promise<ServiceResponse<Person[]>> {
  try {
    const { data: people, error } = await db
      .from('person')
      .select('*')
      .eq('user_id', userId)
      .order('first_name', { ascending: true });

    if (error) {
      throw new ServiceException(ServiceErrorType.DATABASE_ERROR, 'Failed to fetch people', error);
    }

    return { data: people };
  } catch (error) {
    if (error instanceof ServiceException) {
      return {
        data: null,
        error: {
          type: error.type,
          message: error.message,
          details: error.details
        }
      };
    }

    return {
      error: {
        type: ServiceErrorType.INTERNAL_ERROR,
        message: 'An unexpected error occurred while fetching people',
        details: error
      }
    };
  }
}
