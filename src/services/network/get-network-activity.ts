import { createError, errorLogger } from '@/lib/errors';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export type NetworkActivityData = {
  currentPeriod: {
    dates: string[];
    inner5: number[];
    central50: number[];
    strategic100: number[];
    everyone: number[];
  };
  previousPeriod: {
    dates: string[];
    inner5: number[];
    central50: number[];
    strategic100: number[];
    everyone: number[];
  };
  totalActivities: number;
};

export type GetNetworkActivityParams = {
  db: DBClient;
  userId: string;
  days: number;
};

export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_network_activity_failed',
    ErrorType.DATABASE_ERROR,
    'Error fetching network activity data',
    'Unable to load network activity data'
  ),
  INVALID_USER: createError(
    'invalid_user',
    ErrorType.VALIDATION_ERROR,
    'User ID is required',
    'User ID is required to fetch network activity'
  )
};

export type GetNetworkActivityServiceResult = ServiceResponse<NetworkActivityData>;

export async function getNetworkActivity({
  db,
  userId,
  days
}: GetNetworkActivityParams): Promise<GetNetworkActivityServiceResult> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.INVALID_USER };
    }

    // Get current period data
    const currentPeriodResult = await getPeriodData(db, userId, days, 0);

    // Get previous period data
    const previousPeriodResult = await getPeriodData(db, userId, days, days);

    // Calculate total activities
    const totalActivities = currentPeriodResult.reduce(
      (sum, day) => sum + day.inner5 + day.central50 + day.strategic100 + day.everyone,
      0
    );

    return {
      data: {
        currentPeriod: {
          dates: currentPeriodResult.map((d) => d.date),
          inner5: currentPeriodResult.map((d) => d.inner5),
          central50: currentPeriodResult.map((d) => d.central50),
          strategic100: currentPeriodResult.map((d) => d.strategic100),
          everyone: currentPeriodResult.map((d) => d.everyone)
        },
        previousPeriod: {
          dates: previousPeriodResult.map((d) => d.date),
          inner5: previousPeriodResult.map((d) => d.inner5),
          central50: previousPeriodResult.map((d) => d.central50),
          strategic100: previousPeriodResult.map((d) => d.strategic100),
          everyone: previousPeriodResult.map((d) => d.everyone)
        },
        totalActivities
      },
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
    return { data: null, error: ERRORS.FETCH_FAILED };
  }
}

type PeriodData = {
  date: string;
  inner5: number;
  central50: number;
  strategic100: number;
  everyone: number;
};

async function getPeriodData(
  db: DBClient,
  userId: string,
  days: number,
  offset: number
): Promise<PeriodData[]> {
  const { data, error } = await db.rpc('get_network_activity_by_period', {
    p_user_id: userId,
    p_days: days,
    p_offset: offset,
    p_core_group_slugs: [
      RESERVED_GROUP_SLUGS.INNER_5,
      RESERVED_GROUP_SLUGS.CENTRAL_50,
      RESERVED_GROUP_SLUGS.STRATEGIC_100
    ]
  });

  console.log('Network::getPeriodData', data);

  if (error) {
    console.error('Error fetching period data:', error);
    return [];
  }

  return data || [];
}
