import { createError, errorLogger } from '@/lib/errors';
import { DBClient, Person } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  GROUP_MEMBERS: {
    FETCH_ERROR: createError(
      'group_members_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching group members',
      'Unable to load group members at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    ),
    MISSING_ID: createError(
      'missing_id',
      ErrorType.VALIDATION_ERROR,
      'Group identifier is required',
      'Group identifier is missing'
    )
  }
};

export interface GetGroupMembersParams {
  db: DBClient;
  userId: string;
  id: string;
}

export async function getGroupMembers({
  db,
  userId,
  id
}: GetGroupMembersParams): Promise<ServiceResponse<Person[]>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.GROUP_MEMBERS.MISSING_USER_ID };
    }

    if (!id) {
      return { data: null, error: ERRORS.GROUP_MEMBERS.MISSING_ID };
    }

    const { data: people, error } = await db
      .from('group_member')
      .select(
        `
        person (*),
        group!inner (*)
      `
      )
      .eq('group.user_id', userId)
      .eq('group.id', id);

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
