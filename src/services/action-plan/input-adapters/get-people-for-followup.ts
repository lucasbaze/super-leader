import { dateHandler } from '@/lib/dates/helpers';
import { createError } from '@/lib/errors/error-factory';
import { errorLogger } from '@/lib/errors/error-logger';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  FOLLOWUP: {
    FETCH_ERROR: createError(
      'followup_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching people for followup',
      'Unable to load people needing followup at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    )
  }
};

export interface GetPeopleForFollowupParams {
  db: DBClient;
  userId: string;
}

export type GetPeopleForFollowupResult = {
  personIds: string[];
};

export async function getPeopleForFollowup({
  db,
  userId
}: GetPeopleForFollowupParams): Promise<ServiceResponse<GetPeopleForFollowupResult>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.FOLLOWUP.MISSING_USER_ID };
    }

    // Calculate the date 14 days ago
    const fourteenDaysAgo = dateHandler().subtract(14, 'day').toISOString();

    // First, get the central-50 group ID
    const { data: central50Group, error: groupError } = await db
      .from('group')
      .select('id')
      .eq('user_id', userId)
      .eq('slug', RESERVED_GROUP_SLUGS.CENTRAL_50)
      .single();

    if (groupError) {
      const serviceError = ERRORS.FOLLOWUP.FETCH_ERROR;
      errorLogger.log(serviceError, { details: groupError });
      return { data: null, error: serviceError };
    }

    // Get people in central-50 group
    const { data: central50Members, error: membersError } = await db
      .from('group_member')
      .select('person_id')
      .eq('user_id', userId)
      .eq('group_id', central50Group.id);

    if (membersError) {
      const serviceError = ERRORS.FOLLOWUP.FETCH_ERROR;
      errorLogger.log(serviceError, { details: membersError });
      return { data: null, error: serviceError };
    }

    if (!central50Members || central50Members.length === 0) {
      return { data: { personIds: [] }, error: null };
    }

    const central50PersonIds = central50Members.map((member) => member.person_id);

    // Get people who have had interactions in the past 14 days
    const { data: recentInteractions, error: interactionsError } = await db
      .from('interactions')
      .select('person_id')
      .eq('user_id', userId)
      .gte('created_at', fourteenDaysAgo);

    if (interactionsError) {
      const serviceError = ERRORS.FOLLOWUP.FETCH_ERROR;
      errorLogger.log(serviceError, { details: interactionsError });
      return { data: null, error: serviceError };
    }

    const recentInteractionPersonIds = new Set(recentInteractions?.map((interaction) => interaction.person_id) || []);

    // Filter out people who have had recent interactions
    const personIds = central50PersonIds.filter((personId) => !recentInteractionPersonIds.has(personId));

    return {
      data: { personIds },
      error: null
    };
  } catch (error) {
    const serviceError = {
      ...ERRORS.FOLLOWUP.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);

    return { data: null, error: serviceError };
  }
}
