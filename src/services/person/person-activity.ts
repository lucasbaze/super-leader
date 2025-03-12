import { createError, errorLogger } from '@/lib/errors';
import { Database, DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export type TInteraction = Database['public']['Tables']['interactions']['Row'];

export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_failed',
    ErrorType.DATABASE_ERROR,
    'Error in getPersonActivity',
    'Unable to load activity history'
  ),
  CREATE_FAILED: createError(
    'create_failed',
    ErrorType.DATABASE_ERROR,
    'Error creating interaction',
    'Unable to save interaction'
  ),
  INVALID_USER: createError(
    'invalid_user',
    ErrorType.VALIDATION_ERROR,
    'User ID is required',
    'Unable to save interaction'
  ),
  INVALID_PERSON: createError(
    'invalid_person',
    ErrorType.VALIDATION_ERROR,
    'Person ID is required',
    'Unable to save interaction'
  )
};

export type TGetPersonActivityParams = {
  db: DBClient;
  personId: string;
};

export type TCreateInteractionParams = {
  db: DBClient;
  data: {
    person_id: string;
    user_id: string;
    type: string;
    note?: string;
  };
};

export async function getPersonActivity({
  db,
  personId
}: TGetPersonActivityParams): Promise<ServiceResponse<TInteraction[]>> {
  try {
    console.log('getPersonActivity:', personId);
    const { data, error } = await db
      .from('interactions')
      .select('*')
      .eq('person_id', personId)
      .order('created_at', { ascending: false });

    console.log('getPersonActivity:', data, error);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.FETCH_FAILED, { details: error });
    return { data: null, error: ERRORS.FETCH_FAILED };
  }
}

// TODO: Remove these TInteractions
export type CreateInteractionServiceResult = ServiceResponse<TInteraction>;

export async function createInteraction({
  db,
  data
}: TCreateInteractionParams): Promise<CreateInteractionServiceResult> {
  try {
    if (!data.user_id) {
      return { data: null, error: ERRORS.INVALID_USER };
    }

    if (!data.person_id) {
      return { data: null, error: ERRORS.INVALID_PERSON };
    }

    const { data: interaction, error } = await db
      .from('interactions')
      .insert({
        person_id: data.person_id,
        user_id: data.user_id,
        type: data.type,
        note: data.note
      })
      .select('*')
      .single();

    if (error) throw error;

    return { data: interaction, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.CREATE_FAILED, { details: error });
    return { data: null, error: ERRORS.CREATE_FAILED };
  }
}
