import { createError, errorLogger } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  REMOVE_MEMBERS: {
    FAILED: createError(
      'remove_members_failed',
      ErrorType.DATABASE_ERROR,
      'Error removing members from group',
      'Unable to remove members from group'
    ),
    MISSING_GROUP_ID: createError(
      'missing_group_id',
      ErrorType.VALIDATION_ERROR,
      'Group ID is required',
      'Group identifier is missing'
    ),
    MISSING_PERSON_IDS: createError(
      'missing_person_ids',
      ErrorType.VALIDATION_ERROR,
      'Person IDs are required',
      'No people selected to remove'
    )
  }
};

export interface RemoveGroupMembersParams {
  db: DBClient;
  groupId: string;
  personIds: string[];
  userId: string;
}

export type RemoveGroupMembersServiceResult = ServiceResponse<null>;

export async function removeGroupMembers({
  db,
  groupId,
  personIds,
  userId
}: RemoveGroupMembersParams): Promise<RemoveGroupMembersServiceResult> {
  try {
    if (!groupId) {
      return { data: null, error: ERRORS.REMOVE_MEMBERS.MISSING_GROUP_ID };
    }

    if (!personIds.length) {
      return { data: null, error: ERRORS.REMOVE_MEMBERS.MISSING_PERSON_IDS };
    }

    const { error } = await db
      .from('group_member')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .in('person_id', personIds);

    if (error) {
      errorLogger.log(ERRORS.REMOVE_MEMBERS.FAILED, { details: error });
      return { data: null, error: ERRORS.REMOVE_MEMBERS.FAILED };
    }

    return { data: null, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.REMOVE_MEMBERS.FAILED, { details: error });
    return { data: null, error: ERRORS.REMOVE_MEMBERS.FAILED };
  }
}
