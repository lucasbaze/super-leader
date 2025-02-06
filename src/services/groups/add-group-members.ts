import { createError, errorLogger } from '@/lib/errors';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export const ERRORS = {
  ADD_MEMBERS: {
    FAILED: createError(
      'add_members_failed',
      ErrorType.DATABASE_ERROR,
      'Error adding members to group',
      'Unable to add members to group'
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
      'No people selected to add'
    )
  }
};

export interface AddGroupMembersParams {
  db: DBClient;
  groupId: string;
  groupSlug: string;
  personIds: string[];
  userId: string;
}

export async function addGroupMembers({
  db,
  groupId,
  groupSlug,
  personIds,
  userId
}: AddGroupMembersParams): Promise<TServiceResponse<null>> {
  try {
    if (!groupId) {
      return { data: null, error: ERRORS.ADD_MEMBERS.MISSING_GROUP_ID };
    }

    if (!personIds.length) {
      return { data: null, error: ERRORS.ADD_MEMBERS.MISSING_PERSON_IDS };
    }

    // Check if this is a reserved group
    const isReservedGroup = Object.values(RESERVED_GROUP_SLUGS).includes(groupSlug);

    if (isReservedGroup) {
      // Get all reserved group IDs except the current one
      const { data: reservedGroups } = await db
        .from('group')
        .select('id')
        .in('slug', Object.values(RESERVED_GROUP_SLUGS))
        .neq('id', groupId);

      if (reservedGroups?.length) {
        // Remove these people from other reserved groups first
        await db
          .from('group_member')
          .delete()
          .in(
            'group_id',
            reservedGroups.map((g) => g.id)
          )
          .in('person_id', personIds)
          .eq('user_id', userId);
      }
    }

    // Now add the members to the new group
    const members = personIds.map((personId) => ({
      group_id: groupId,
      person_id: personId,
      user_id: userId
    }));

    const { error } = await db.from('group_member').upsert(members, {
      onConflict: 'group_id,person_id,user_id',
      ignoreDuplicates: true
    });

    if (error) {
      errorLogger.log(ERRORS.ADD_MEMBERS.FAILED, { details: error });
      return { data: null, error: ERRORS.ADD_MEMBERS.FAILED };
    }

    return { data: null, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.ADD_MEMBERS.FAILED, { details: error });
    return { data: null, error: ERRORS.ADD_MEMBERS.FAILED };
  }
}
