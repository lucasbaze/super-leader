import { SupabaseClient } from '@supabase/supabase-js';

import { createError, errorLogger } from '@/lib/errors';
import { Database, DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

export type TInteraction = Database['public']['Tables']['interactions']['Row'];

export const ERRORS = {
  FETCH_FAILED: createError(
    'fetch_failed',
    ErrorType.DATABASE_ERROR,
    'Error in getPersonActivity',
    'Unable to load activity history'
  )
};

export type TGetPersonActivityParams = {
  db: DBClient;
  personId: string;
};

export async function getPersonActivity({
  db,
  personId
}: TGetPersonActivityParams): Promise<TServiceResponse<TInteraction[]>> {
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
