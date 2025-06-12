import { createErrorV2 } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { AccountStatus, AuthStatus } from '@/types/custom';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  UPDATE_FAILED: createErrorV2({
    name: 'update_integrated_account_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to update integrated account',
    displayMessage: 'Unable to update account'
  })
};

export interface UpdateIntegratedAccountParams {
  db: DBClient;
  accountId: string;
  authStatus: AuthStatus;
  accountStatus?: AccountStatus;
}

export async function updateIntegratedAccount({
  db,
  accountId,
  authStatus,
  accountStatus
}: UpdateIntegratedAccountParams): Promise<ServiceResponse<any>> {
  try {
    const { data, error } = await db
      .from('integrated_accounts')
      .update({ auth_status: authStatus, account_status: accountStatus })
      .eq('account_id', accountId)
      .select()
      .single();

    if (error) {
      errorLogger.log(ERRORS.UPDATE_FAILED, { details: error });
      return { data: null, error: ERRORS.UPDATE_FAILED };
    }

    return { data, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.UPDATE_FAILED, { details: error });
    return { data: null, error: ERRORS.UPDATE_FAILED };
  }
}
