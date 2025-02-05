import { createError, errorLogger } from '@/lib/errors';
import { generateSlug } from '@/lib/utils';
import { DBClient, Group } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_failed',
    ErrorType.DATABASE_ERROR,
    'Error fetching groups',
    'Unable to load groups'
  ),
  CREATE_FAILED: createError(
    'create_failed',
    ErrorType.DATABASE_ERROR,
    'Error creating group',
    'Unable to create group'
  ),
  SLUG_EXISTS: createError(
    'slug_exists',
    ErrorType.VALIDATION_ERROR,
    'Group slug already exists',
    'A group with this name already exists'
  ),
  INVALID_NAME: createError(
    'invalid_name',
    ErrorType.VALIDATION_ERROR,
    'Group name is required',
    'Please provide a group name'
  )
};

export type TCreateGroupParams = {
  db: DBClient;
  data: {
    name: string;
    icon: string;
    user_id: string;
    person_ids?: string[];
  };
};

export type TGenerateUniqueSlugParams = {
  db: DBClient;
  name: string;
  userId: string;
};

async function generateUniqueSlug({
  db,
  name,
  userId
}: TGenerateUniqueSlugParams): Promise<string> {
  let slug = generateSlug(name);
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const { data } = await db
      .from('group')
      .select('id')
      .eq('slug', slug)
      .eq('user_id', userId)
      .single();
    if (!data) {
      isUnique = true;
    } else {
      slug = `${generateSlug(name)}-${counter}`;
      counter++;
    }
  }

  return slug;
}

export async function createGroup({
  db,
  data
}: TCreateGroupParams): Promise<TServiceResponse<Group>> {
  try {
    if (!data.name) {
      return { data: null, error: ERRORS.INVALID_NAME };
    }

    const slug = await generateUniqueSlug({ db, name: data.name, userId: data.user_id });

    // Start a transaction
    const { data: group, error: groupError } = await db
      .from('group')
      .insert({
        name: data.name,
        icon: data.icon,
        slug,
        user_id: data.user_id
      })
      .select('*')
      .single();

    if (groupError) throw groupError;

    // If we have person_ids, create group members
    if (data.person_ids?.length) {
      const groupMembers = data.person_ids.map((person_id) => ({
        group_id: group.id,
        person_id,
        user_id: data.user_id
      }));

      const { error: membersError } = await db.from('group_member').insert(groupMembers);

      if (membersError) throw membersError;
    }

    return { data: group, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.CREATE_FAILED, { details: error });
    return { data: null, error: ERRORS.CREATE_FAILED };
  }
}
