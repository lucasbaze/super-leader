import { createError, errorLogger } from '@/lib/errors';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

type Person = {
  name: string;
};

type ActivityGroup = {
  group_name: string;
  interaction_count: number;
  people: Person[];
};

export type TodaysActivityGroup = {
  count: number;
  people: Person[];
};

export type TodaysActivityData = {
  inner5: TodaysActivityGroup;
  central50: TodaysActivityGroup;
  strategic100: TodaysActivityGroup;
  everyone: TodaysActivityGroup;
};

export type GetTodaysActivityParams = {
  db: DBClient;
  userId: string;
  timezone?: string;
};

export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_todays_activity_failed',
    ErrorType.DATABASE_ERROR,
    "Error fetching today's activity data",
    "Unable to load today's activity data"
  ),
  INVALID_USER: createError(
    'invalid_user',
    ErrorType.VALIDATION_ERROR,
    'User ID is required',
    "User ID is required to fetch today's activity"
  )
};

export type GetTodaysActivityServiceResult = ServiceResponse<TodaysActivityData>;

export async function getTodaysActivity({
  db,
  userId,
  timezone = 'UTC'
}: GetTodaysActivityParams): Promise<GetTodaysActivityServiceResult> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.INVALID_USER };
    }

    const { data, error } = await db.rpc('get_todays_network_activity', {
      p_user_id: userId,
      p_core_group_slugs: [
        RESERVED_GROUP_SLUGS.INNER_5,
        RESERVED_GROUP_SLUGS.CENTRAL_50,
        RESERVED_GROUP_SLUGS.STRATEGIC_100
      ],
      p_timezone: timezone
    });

    if (error) {
      errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
      return { data: null, error: ERRORS.FETCH_FAILED };
    }

    // Initialize default structure
    const defaultActivity: TodaysActivityData = {
      inner5: { count: 0, people: [] },
      central50: { count: 0, people: [] },
      strategic100: { count: 0, people: [] },
      everyone: { count: 0, people: [] }
    };

    // Map the results to our structure
    if (data) {
      data.forEach((group: ActivityGroup) => {
        const groupData = {
          count: Number(group.interaction_count),
          people: group.people as Person[]
        };

        switch (group.group_name) {
          case 'inner5':
            defaultActivity.inner5 = groupData;
            break;
          case 'central50':
            defaultActivity.central50 = groupData;
            break;
          case 'strategic100':
            defaultActivity.strategic100 = groupData;
            break;
          case 'everyone':
            defaultActivity.everyone = groupData;
            break;
        }
      });
    }

    return {
      data: defaultActivity,
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
    return { data: null, error: ERRORS.FETCH_FAILED };
  }
}
