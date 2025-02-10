import { createError, errorLogger } from '@/lib/errors';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export const ERRORS = {
  SETUP_FAILED: createError(
    'setup_failed',
    ErrorType.DATABASE_ERROR,
    'Error setting up user',
    'Unable to setup user groups'
  ),
  INVALID_USER: createError(
    'invalid_user',
    ErrorType.VALIDATION_ERROR,
    'User ID is required',
    'Please provide a user ID'
  )
};

export const DEFAULT_GROUPS = [
  {
    name: 'Inner 5',
    slug: RESERVED_GROUP_SLUGS.INNER_5,
    icon: '5'
  },
  {
    name: 'Central 50',
    slug: RESERVED_GROUP_SLUGS.CENTRAL_50,
    icon: '50'
  },
  {
    name: 'Strategic 100',
    slug: RESERVED_GROUP_SLUGS.STRATEGIC_100,
    icon: '100'
  },
  {
    name: 'School',
    slug: 'school',
    icon: '🎓'
  },
  {
    name: 'Community',
    slug: 'community',
    icon: '🏘️'
  },
  {
    name: 'Work',
    slug: 'work',
    icon: '💼'
  }
] as const;

export type TSetupNewUserParams = {
  db: DBClient;
  userId: string;
};

export async function setupNewUser({
  db,
  userId
}: TSetupNewUserParams): Promise<TServiceResponse<boolean | null>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.INVALID_USER };
    }

    const results = await Promise.all(
      DEFAULT_GROUPS.map((group) =>
        db
          .from('group')
          .insert({
            user_id: userId,
            name: group.name,
            slug: group.slug,
            icon: group.icon
          })
          .select()
      )
    );

    return { data: true, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.SETUP_FAILED, { details: error });
    return { data: null, error: ERRORS.SETUP_FAILED };
  }
}
