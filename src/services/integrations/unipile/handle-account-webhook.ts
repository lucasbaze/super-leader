import { createErrorV2 } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { AuthStatus } from '@/types/custom';
import { ErrorType } from '@/types/errors';
import { HandleAccountWebhookParams } from '@/types/integrations/unipile';
import { ServiceResponse } from '@/types/service-response';

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

export async function handleAccountWebhook({
  db,
  payload,
  unipileClient
}: HandleAccountWebhookParams): Promise<ServiceResponse<any>> {
  try {
    // 1. Check if account exists
    const { data: existingAccount } = await db
      .from('integrated_accounts')
      .select()
      .eq('account_id', payload.account_id)
      .single();

    if (!existingAccount) {
      return { data: null, error: ERRORS.ACCOUNT_NOT_FOUND };
    }

    // 2. If status differs, update
    if (existingAccount.auth_status !== payload.message) {
      const { data: updatedAccount, error: updateError } = await updateIntegratedAccount({
        db,
        accountId: payload.account_id,
        authStatus: payload.message as AuthStatus
      });

      if (updateError) throw updateError;

      // Handle CREDENTIALS status
      if (payload.message === 'CREDENTIALS') {
        // TODO: Trigger email or UI notification
        console.log('Credentials need to be updated for account:', payload.account_id);
      }

      return { data: updatedAccount, error: null };
    }

    return { data: existingAccount, error: null };
  } catch (error) {
    errorLogger.log(ERRORS.HANDLE_WEBHOOK_FAILED, { details: error });
    return { data: null, error: ERRORS.HANDLE_WEBHOOK_FAILED };
  }
}

/*

Webhook

"AccountStatus": {  
    "account_id": "h_EKCy2lRLef5NzHp0iw4A",  
    "account_type": "LINKEDIN",  
    "message": "CREDENTIALS"  
  } 
  
Update the account status and trigger any side-effects
  

  Callback

Unipile Callback Called {
    status: 'CREATION_SUCCESS',
    account_id: 'EKpfqXZ3QCeO2MVdvycIsg',
    name: 'c86eb445-a7cd-44c1-a0e0-3dd661ebb526'
    account_name: 'LINKEDIN' // I'm injecting this one
  }

Create the account, and trigger the initial sync

*/
