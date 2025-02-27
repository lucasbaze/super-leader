import { createError, errorLogger } from '@/lib/errors';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

// Define the response type
export type NetworkCompletenessData = {
  inner5: {
    completeness_score: number;
    count: number;
  };
  central50: {
    completeness_score: number;
    count: number;
  };
  strategic100: {
    completeness_score: number;
    count: number;
  };
  everyone: {
    completeness_score: number;
    count: number;
  };
};

// Define service params interface
export type GetNetworkCompletenessParams = {
  db: DBClient;
  userId: string;
};

// Define errors
export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_network_completeness_failed',
    ErrorType.DATABASE_ERROR,
    'Error fetching network completeness data',
    'Unable to load network completeness data'
  ),
  INVALID_USER: createError(
    'invalid_user',
    ErrorType.VALIDATION_ERROR,
    'User ID is required',
    'User ID is required to fetch network completeness'
  )
};

export type GetNetworkCompletenessServiceResult = TServiceResponse<NetworkCompletenessData>;

export async function getNetworkCompleteness({
  db,
  userId
}: GetNetworkCompletenessParams): Promise<GetNetworkCompletenessServiceResult> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.INVALID_USER };
    }

    // Get completeness scores for Inner 5
    const inner5Result = await getGroupCompleteness(db, userId, RESERVED_GROUP_SLUGS.INNER_5);

    // Get completeness scores for Central 50
    const central50Result = await getGroupCompleteness(db, userId, RESERVED_GROUP_SLUGS.CENTRAL_50);

    // Get completeness scores for Strategic 100
    const strategic100Result = await getGroupCompleteness(
      db,
      userId,
      RESERVED_GROUP_SLUGS.STRATEGIC_100
    );

    // Get completeness scores for everyone else
    const everyoneElseResult = await getEveryoneElseCompleteness(db, userId);

    return {
      data: {
        inner5: inner5Result,
        central50: central50Result,
        strategic100: strategic100Result,
        everyone: everyoneElseResult
      },
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
    return { data: null, error: ERRORS.FETCH_FAILED };
  }
}

// Helper function to get average completeness for a specific group
async function getGroupCompleteness(
  db: DBClient,
  userId: string,
  groupSlug: string
): Promise<{ completeness_score: number; count: number }> {
  try {
    const { data, error } = await db
      .from('group')
      .select(
        `
        id,
        person:group_member(
          person:person(
            completeness_score
          )
        )
      `
      )
      .eq('user_id', userId)
      .eq('slug', groupSlug)
      .single();

    if (error || !data || !data.person || data.person.length === 0) {
      return { completeness_score: 0, count: 0 };
    }

    // Extract all completeness scores from the nested result
    const completenessScores = data.person
      .map((gm: any) => gm.person?.completeness_score || 0)
      .filter((score: number) => score !== null);

    if (completenessScores.length === 0) {
      return { completeness_score: 0, count: 0 };
    }

    // Calculate average
    const totalCompleteness = completenessScores.reduce(
      (sum: number, score: number) => sum + score,
      0
    );

    return {
      completeness_score: Math.round(totalCompleteness / completenessScores.length),
      count: completenessScores.length
    };
  } catch (error) {
    console.error('Error getting group completeness:', error);
    return { completeness_score: 0, count: 0 };
  }
}

// Helper function to get overall completeness (excluding people in core groups)
async function getEveryoneElseCompleteness(
  db: DBClient,
  userId: string
): Promise<{ completeness_score: number; count: number }> {
  try {
    // Use a raw SQL query to calculate the average directly in the database
    const {
      data,
      error
    }: { data: { avg_completeness: number; count: number } | null; error: any } = await db
      .rpc('get_everyone_else_completeness_score', {
        p_user_id: userId,
        p_core_group_slugs: [
          RESERVED_GROUP_SLUGS.INNER_5,
          RESERVED_GROUP_SLUGS.CENTRAL_50,
          RESERVED_GROUP_SLUGS.STRATEGIC_100
        ]
      })
      .single();

    if (error) {
      console.error('Error fetching everyone else completeness:', error);
      return { completeness_score: 0, count: 0 };
    }

    if (!data) {
      return { completeness_score: 0, count: 0 };
    }

    return {
      completeness_score: Math.round(data.avg_completeness || 0),
      count: data.count || 0
    };
  } catch (error) {
    console.error('Error getting everyone else completeness:', error);
    return { completeness_score: 0, count: 0 };
  }
}
