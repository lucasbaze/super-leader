import { createError, errorLogger } from '@/lib/errors';
import { DBClient, IntegratedAccount } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  INTEGRATED_ACCOUNTS: {
    FETCH_ERROR: createError(
      'integrated_accounts_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching integrated apps data',
      'Unable to load your connected accounts at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    )
  }
};

export interface GetIntegratedAccountsParams {
  db: DBClient;
  userId: string;
}

export type GetIntegratedAccountsServiceResult = ServiceResponse<IntegratedAccount[]>;

export async function getIntegratedAccounts({
  db,
  userId
}: GetIntegratedAccountsParams): Promise<GetIntegratedAccountsServiceResult> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.INTEGRATED_ACCOUNTS.MISSING_USER_ID };
    }

    const { data: apps, error } = await db.from('integrated_accounts').select('*').eq('user_id', userId);

    if (error) {
      const serviceError = { ...ERRORS.INTEGRATED_ACCOUNTS.FETCH_ERROR, details: error };
      errorLogger.log(serviceError);
      return { data: null, error: serviceError };
    }

    return { data: apps, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.INTEGRATED_ACCOUNTS.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
