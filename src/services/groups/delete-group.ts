import { createError, errorLogger } from '@/lib/errors';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export const ERRORS = {
  DELETE_GROUP: {
    FAILED: createError(
      'delete_group_failed',
      ErrorType.DATABASE_ERROR,
      'Error deleting group',
      'Unable to delete group'
    ),
    MISSING_ID: createError(
      'missing_id',
      ErrorType.VALIDATION_ERROR,
      'Group ID is required',
      'Group identifier is missing'
    ),
    RESERVED_GROUP: createError(
      'reserved_group',
      ErrorType.VALIDATION_ERROR,
      'Cannot delete reserved group',
      'This group cannot be deleted'
    )
  }
};

export interface DeleteGroupParams {
  db: DBClient;
  groupId: string;
  userId: string;
}

export async function deleteGroup({
  db,
  groupId,
  userId
}: DeleteGroupParams): Promise<TServiceResponse<null>> {
  try {
    if (!groupId) {
      return { data: null, error: ERRORS.DELETE_GROUP.MISSING_ID };
    }

    // Check if this is a reserved group
    const { data: group } = await db.from('group').select('slug').eq('id', groupId).single();

    if (group && Object.values(RESERVED_GROUP_SLUGS).includes(group.slug)) {
      return { data: null, error: ERRORS.DELETE_GROUP.RESERVED_GROUP };
    }

    // Delete group members first (due to foreign key constraints)
    const { error: membersError } = await db
      .from('group_member')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (membersError) {
      errorLogger.log(ERRORS.DELETE_GROUP.FAILED, { details: membersError });
      return { data: null, error: ERRORS.DELETE_GROUP.FAILED };
    }

    // Now delete the group
    const { error } = await db.from('group').delete().eq('id', groupId).eq('user_id', userId);

    if (error) {
      errorLogger.log(ERRORS.DELETE_GROUP.FAILED, { details: error });
      return { data: null, error: ERRORS.DELETE_GROUP.FAILED };
    }

    return { data: null, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.DELETE_GROUP.FAILED, { details: error });
    return { data: null, error: ERRORS.DELETE_GROUP.FAILED };
  }
}
