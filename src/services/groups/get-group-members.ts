import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient, Person } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export const ERRORS = {
  GROUP_MEMBERS: {
    FETCH_ERROR: createError(
      'group_members_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching group members',
      'Unable to load group members at this time'
    )
  }
};

export interface GetGroupMembersParams {
  db: DBClient;
  userId: string;
  slug: string;
}

export async function getGroupMembers({
  db,
  userId,
  slug
}: GetGroupMembersParams): Promise<TServiceResponse<Person[]>> {
  try {
    const { data: people, error } = await db
      .from('group_member')
      .select(
        `
        person (*),
        group!inner (*)
      `
      )
      .eq('group.user_id', userId)
      .eq('group.slug', slug);

    if (error) {
      const serviceError = ERRORS.GROUP_MEMBERS.FETCH_ERROR;
      errorLogger.log(serviceError, { details: error });
      return { data: null, error: serviceError };
    }

    // Extract person data from the nested structure
    const members = people.map((row: any) => row.person);
    return { data: members, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.GROUP_MEMBERS.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
