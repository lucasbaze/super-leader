import { z } from 'zod';

import { createErrorV2 } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { AUTH_STATUS, AuthStatus } from '@/types/custom';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { deleteIntegratedAccount } from './delete-integrated-account';
import { updateIntegratedAccount } from './update-integrated-account';

export const ERRORS = {
  ACCOUNT_NOT_FOUND: createErrorV2({
    name: 'account_not_found',
    type: ErrorType.VALIDATION_ERROR,
    message: 'Account not found',
    displayMessage: 'Account not found'
  }),
  HANDLE_WEBHOOK_FAILED: createErrorV2({
    name: 'handle_webhook_failed',
    type: ErrorType.API_ERROR,
    message: 'Failed to handle webhook',
    displayMessage: 'Unable to process webhook'
  })
};

// https://developer.unipile.com/docs/account-lifecycle
export const unipileAccountStatusWebhookSchema = z.object({
  AccountStatus: z.object({
    account_id: z.string(),
    account_type: z.string(),
    message: z.string() // This will be the AuthStatus value
  })
});

export type UnipileWebhookPayload = z.infer<typeof unipileAccountStatusWebhookSchema>;
export interface HandleAccountWebhookParams {
  db: DBClient;
  payload: UnipileWebhookPayload;
}

export async function handleAccountWebhook({ db, payload }: HandleAccountWebhookParams): Promise<ServiceResponse<any>> {
  try {
    const validatedBody = unipileAccountStatusWebhookSchema.safeParse(payload);

    if (!validatedBody.success) {
      console.error('[Unipile Callback] Error parsing body', validatedBody.error);
      return { data: null, error: ERRORS.HANDLE_WEBHOOK_FAILED };
    }

    const { account_id, account_type, message } = validatedBody.data.AccountStatus;

    // 0. Check if the message is

    // 1. Check if account exists
    const { data: existingAccount } = await db
      .from('integrated_accounts')
      .select()
      .eq('account_id', account_id)
      .single();

    if (!existingAccount) {
      return { data: null, error: ERRORS.ACCOUNT_NOT_FOUND };
    }

    // 2. If the account is deleted, delete it
    if (existingAccount && message === AUTH_STATUS.DELETED) {
      const { data: deletedAccount, error: deleteError } = await deleteIntegratedAccount({
        db,
        accountId: account_id
      });

      if (deleteError) throw deleteError;

      return { data: deletedAccount, error: null };
    }

    // 3. If status differs, update
    if (existingAccount.auth_status !== message) {
      const { data: updatedAccount, error: updateError } = await updateIntegratedAccount({
        db,
        accountId: account_id,
        authStatus: message as AuthStatus
      });

      if (updateError) throw updateError;

      // Handle CREDENTIALS status
      if (message === AUTH_STATUS.CREDENTIALS) {
        // TODO: Trigger email or UI notification
        console.log('Credentials need to be updated for account:', account_id);
      }

      return { data: updatedAccount, error: null };
    }

    return { data: existingAccount, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.HANDLE_WEBHOOK_FAILED, { details: error });
    return { data: null, error: ERRORS.HANDLE_WEBHOOK_FAILED };
  }
}
