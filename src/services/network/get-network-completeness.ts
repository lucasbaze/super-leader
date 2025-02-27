import { createError, errorLogger } from '@/lib/errors';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

// Define the response type
export type TNetworkCompletenessData = {
  inner5: number;
  central50: number;
  strategic100: number;
  everyone: number;
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

export type GetNetworkCompletenessServiceResult = TServiceResponse<TNetworkCompletenessData>;

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
): Promise<number> {
  try {
    // Get average completeness score in a single query using joins
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
      return 0;
    }

    // Extract all completeness scores from the nested result
    const completenessScores = data.person
      .map((gm: any) => gm.person?.completeness_score || 0)
      .filter((score: number) => score !== null);

    if (completenessScores.length === 0) {
      return 0;
    }

    // Calculate average
    const totalCompleteness = completenessScores.reduce(
      (sum: number, score: number) => sum + score,
      0
    );

    return Math.round(totalCompleteness / completenessScores.length);
  } catch (error) {
    console.error('Error getting group completeness:', error);
    return 0;
  }
}

// Helper function to get overall completeness (excluding people in core groups)
async function getEveryoneElseCompleteness(db: DBClient, userId: string): Promise<number> {
  try {
    // First, get all person IDs from the core groups
    const { data: coreGroupMembers, error: coreGroupError } = await db
      .from('group')
      .select(
        `
        group_member!inner(person_id)
      `
      )
      .eq('user_id', userId)
      .in('slug', [
        RESERVED_GROUP_SLUGS.INNER_5,
        RESERVED_GROUP_SLUGS.CENTRAL_50,
        RESERVED_GROUP_SLUGS.STRATEGIC_100
      ]);

    if (coreGroupError) {
      console.error('Error fetching core group members:', coreGroupError);
      return 0;
    }

    // Extract all person IDs from the core groups
    const corePersonIds = new Set<string>();

    if (coreGroupMembers) {
      coreGroupMembers.forEach((group) => {
        if (group.group_member) {
          group.group_member.forEach((member: any) => {
            if (member.person_id) {
              corePersonIds.add(member.person_id);
            }
          });
        }
      });
    }

    // Get all people excluding those in core groups
    let query = db.from('person').select('completeness_score').eq('user_id', userId);

    // If we have core person IDs, exclude them
    if (corePersonIds.size > 0) {
      // Convert to array and use the 'in' operator with 'not'
      const corePersonIdsArray = Array.from(corePersonIds);
      query = query.not('id', 'in', `(${corePersonIdsArray.map((id) => `${id}`).join(',')})`);
    }

    const { data: people, error } = await query;

    if (error) {
      console.error('Error fetching people for everyone else:', error);
      return 0;
    }

    if (!people || people.length === 0) {
      return 0;
    }

    // Calculate average completeness
    const totalCompleteness = people.reduce(
      (sum, person) => sum + (person.completeness_score || 0),
      0
    );

    return Math.round(totalCompleteness / people.length);
  } catch (error) {
    console.error('Error getting everyone else completeness:', error);
    return 0;
  }
}
