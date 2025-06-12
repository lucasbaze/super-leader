import { createErrorV2 } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  DELETE_FAILED: createErrorV2({
    name: 'delete_integrated_account_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to delete integrated account',
    displayMessage: 'Unable to delete account'
  }),
  ACCOUNT_NOT_FOUND: createErrorV2({
    name: 'account_not_found',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Account not found',
    displayMessage: 'Account not found'
  })
};

export interface DeleteIntegratedAccountParams {
  db: DBClient;
  accountId: string;
}

export async function deleteIntegratedAccount({
  db,
  accountId
}: DeleteIntegratedAccountParams): Promise<ServiceResponse<any>> {
  try {
    // 1. Check if account exists
    const { data: existingAccount } = await db
      .from('integrated_accounts')
      .select()
      .eq('account_id', accountId)
      .single();

    if (!existingAccount) {
      return { data: null, error: ERRORS.ACCOUNT_NOT_FOUND };
    }

    // 2. Delete the account
    const { error } = await db.from('integrated_accounts').delete().eq('account_id', accountId);

    if (error) {
      errorLogger.log(ERRORS.DELETE_FAILED, { details: error });
      return { data: null, error: ERRORS.DELETE_FAILED };
    }

    return { data: existingAccount, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.DELETE_FAILED, { details: error });
    return { data: null, error: ERRORS.DELETE_FAILED };
  }
}
