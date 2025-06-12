import { z } from 'zod';

import { createErrorV2 } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { ACCOUNT_NAMES, ACCOUNT_STATUS, AccountName, AccountStatus, AUTH_STATUS, AuthStatus } from '@/types/custom';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

// Validation schema for the account parameters
const createAccountSchema = z.object({
  accountName: z.nativeEnum(ACCOUNT_NAMES),
  accountStatus: z.nativeEnum(ACCOUNT_STATUS),
  authStatus: z.nativeEnum(AUTH_STATUS)
});

export const ERRORS = {
  CREATE_FAILED: createErrorV2({
    name: 'create_integrated_account_failed',
    type: ErrorType.DATABASE_ERROR,
    message: 'Failed to create integrated account',
    displayMessage: 'Unable to create account'
  }),
  VALIDATION_FAILED: createErrorV2({
    name: 'create_integrated_account_validation_failed',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Invalid account parameters provided',
    displayMessage: 'Invalid account information provided'
  })
};

// https://developer.unipile.com/docs/account-lifecycle
export interface CreateIntegratedAccountParams {
  db: DBClient;
  userId: string;
  accountId: string;
  accountName: AccountName;
  accountStatus: AccountStatus;
  authStatus: AuthStatus;
}

export async function createIntegratedAccount({
  db,
  userId,
  accountId,
  accountStatus,
  accountName,
  authStatus
}: CreateIntegratedAccountParams): Promise<ServiceResponse<any>> {
  try {
    // Validate the account parameters
    const validationResult = createAccountSchema.safeParse({
      accountName,
      accountStatus,
      authStatus
    });

    if (!validationResult.success) {
      errorLogger.log(ERRORS.VALIDATION_FAILED, {
        details: validationResult.error,
        params: { accountName, accountStatus, authStatus }
      });
      return { data: null, error: ERRORS.VALIDATION_FAILED };
    }

    const { data, error } = await db
      .from('integrated_accounts')
      .insert({
        user_id: userId,
        account_id: accountId,
        account_name: accountName,
        account_status: accountStatus,
        auth_status: authStatus
      })
      .select()
      .single();

    if (error) {
      errorLogger.log(ERRORS.CREATE_FAILED, { details: error });
      return { data: null, error: ERRORS.CREATE_FAILED };
    }

    return { data, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.CREATE_FAILED, { details: error });
    return { data: null, error: ERRORS.CREATE_FAILED };
  }
}
