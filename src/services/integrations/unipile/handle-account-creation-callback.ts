import { z } from 'zod';

import { createErrorV2 } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { getUserProfile } from '@/services/user/get-user-profile';
import { initialLinkedInContactSyncTask } from '@/trigger/linkedin-contact-sync';
import { ACCOUNT_NAMES, AccountStatus, AuthStatus } from '@/types/custom';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { createIntegratedAccount } from './create-integrated-account';

const unipileAccountCreationCallbackSchema = z.object({
  userId: z.string(),
  accountId: z.string(),
  accountName: z.nativeEnum(ACCOUNT_NAMES),
  status: z.string()
});
type UnipileCreationCallbackPayload = z.infer<typeof unipileAccountCreationCallbackSchema>;

interface HandleAccountCreationCallbackParams {
  db: DBClient;
  payload: UnipileCreationCallbackPayload;
}

export const ERRORS = {
  INVALID_USER: createErrorV2({
    name: 'invalid_user',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Invalid user ID provided',
    displayMessage: 'Invalid user account'
  }),
  ACCOUNT_EXISTS: createErrorV2({
    name: 'account_exists',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Account already exists',
    displayMessage: 'This account has already been connected'
  }),
  INVALID_STATUS: createErrorV2({
    name: 'invalid_status',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Invalid creation status',
    displayMessage: 'Invalid account creation status'
  }),
  HANDLE_CALLBACK_FAILED: createErrorV2({
    name: 'handle_callback_failed',
    type: ErrorType.API_ERROR,
    message: 'Failed to handle creation callback',
    displayMessage: 'Unable to process account creation'
  })
};

export async function handleAccountCreationCallback({
  db,
  payload
}: HandleAccountCreationCallbackParams): Promise<ServiceResponse<any>> {
  try {
    console.log('Handle Unipile Account Creation Callback', payload);
    // 1. Validate creation status
    if (payload.status !== 'CREATION_SUCCESS') {
      return { data: null, error: ERRORS.INVALID_STATUS };
    }

    // 2. Check if account already exists
    const { data: existingAccount } = await db
      .from('integrated_accounts')
      .select()
      .eq('account_id', payload.accountId)
      .single();

    if (existingAccount) {
      return { data: null, error: ERRORS.ACCOUNT_EXISTS };
    }

    // 3. Validate user exists
    const { data: userProfile } = await getUserProfile({
      db,
      userId: payload.userId.trim()
    });

    if (!userProfile) {
      console.log('User profile not found for userId:', payload.userId);
      return { data: null, error: ERRORS.INVALID_USER };
    }

    //4. Maybe check if the unipile exists using the unipileClient

    // 5. Create new account
    const { data: newAccount, error: createError } = await createIntegratedAccount({
      db,
      userId: payload.userId,
      accountId: payload.accountId,
      accountName: payload.accountName,
      accountStatus: 'ACTIVE' as AccountStatus,
      authStatus: 'CREATION_SUCCESS' as AuthStatus
    });

    if (createError) throw createError;

    // 6. If LinkedIn account, trigger sync
    if (payload.accountName === ACCOUNT_NAMES.LINKEDIN) {
      console.log('Triggering LinkedIn sync');

      await initialLinkedInContactSyncTask.trigger(
        {
          userId: payload.userId,
          accountId: payload.accountId
        },
        {
          tags: [`user:${payload.userId}`]
        }
      );
    }

    console.log('Handle Account Creation Callback Result', newAccount);

    return { data: newAccount, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.HANDLE_CALLBACK_FAILED, { details: error });
    return { data: null, error: ERRORS.HANDLE_CALLBACK_FAILED };
  }
}
