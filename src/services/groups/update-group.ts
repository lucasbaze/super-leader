import { createError, errorLogger } from '@/lib/errors';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { DBClient, Group } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

import { createUniqueSlug } from './create-unique-slug';

export const ERRORS = {
  UPDATE_GROUP: {
    FAILED: createError(
      'update_group_failed',
      ErrorType.DATABASE_ERROR,
      'Error updating group',
      'Unable to update group'
    ),
    MISSING_ID: createError(
      'missing_id',
      ErrorType.VALIDATION_ERROR,
      'Group ID is required',
      'Group identifier is missing'
    ),
    NO_CHANGES: createError(
      'no_changes',
      ErrorType.VALIDATION_ERROR,
      'No changes provided',
      'No changes to update'
    ),
    RESERVED_GROUP: createError(
      'reserved_group',
      ErrorType.VALIDATION_ERROR,
      'Cannot update reserved group name',
      'This group name cannot be changed'
    )
  }
};

export interface UpdateGroupParams {
  db: DBClient;
  groupId: string;
  name?: string;
  icon?: string;
  userId: string;
}

export type TUpdateGroupResponse = Pick<Group, 'id' | 'name' | 'slug' | 'icon'>;

export async function updateGroup({
  db,
  groupId,
  name,
  icon,
  userId
}: UpdateGroupParams): Promise<TServiceResponse<TUpdateGroupResponse>> {
  try {
    if (!groupId) {
      return { data: null, error: ERRORS.UPDATE_GROUP.MISSING_ID };
    }

    if (!name && !icon) {
      return { data: null, error: ERRORS.UPDATE_GROUP.NO_CHANGES };
    }

    // Get current group
    const { data: currentGroup } = await db
      .from('group')
      .select('name, slug, icon')
      .eq('id', groupId)
      .single();

    if (!currentGroup) {
      return { data: null, error: ERRORS.UPDATE_GROUP.FAILED };
    }

    // Check if this is a reserved group
    if (Object.values(RESERVED_GROUP_SLUGS).includes(currentGroup.slug)) {
      return { data: null, error: ERRORS.UPDATE_GROUP.RESERVED_GROUP };
    }

    // Prepare update data
    const updates: { name?: string; icon?: string; slug?: string } = {};

    // Handle name update and slug generation
    if (name && name !== currentGroup.name) {
      updates.name = name;
      const slugResult = await createUniqueSlug({
        db,
        name,
        table: 'group',
        userId
      });

      if (slugResult.error) {
        return { data: null, error: slugResult.error };
      }

      updates.slug = slugResult.data!;
    }

    // Handle icon update
    if (icon && icon !== currentGroup.icon) {
      updates.icon = icon;
    }

    // If no actual changes, return early
    if (Object.keys(updates).length === 0) {
      return { data: null, error: null };
    }

    const { data, error } = await db
      .from('group')
      .update(updates)
      .eq('id', groupId)
      .eq('user_id', userId)
      .select('id, name, slug, icon')
      .single();

    if (error) {
      errorLogger.log(ERRORS.UPDATE_GROUP.FAILED, { details: error });
      return { data: null, error: ERRORS.UPDATE_GROUP.FAILED };
    }

    return { data, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.UPDATE_GROUP.FAILED, { details: error });
    return { data: null, error: ERRORS.UPDATE_GROUP.FAILED };
  }
}
