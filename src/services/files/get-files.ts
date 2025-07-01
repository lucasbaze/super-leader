import { createError, errorLogger } from '@/lib/errors';
import { DBClient, File } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  FILES: {
    FETCH_ERROR: createError(
      'files_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching files',
      'Unable to load files'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    )
  }
};

export interface GetFilesParams {
  db: DBClient;
  userId: string;
}

export async function getFiles({ db, userId }: GetFilesParams): Promise<ServiceResponse<File[]>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.FILES.MISSING_USER_ID };
    }

    const { data, error } = await db
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      const serviceError = ERRORS.FILES.FETCH_ERROR;
      errorLogger.log(serviceError, { details: error });
      return { data: null, error: serviceError };
    }

    return { data: data || [], error: null };
  } catch (error) {
    const serviceError = { ...ERRORS.FILES.FETCH_ERROR, details: error };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
