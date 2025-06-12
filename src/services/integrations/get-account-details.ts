import { createErrorV2 } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { AccountName, AccountStatus } from '@/types/custom';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

export const ERRORS = {
  GET_ACCOUNT_FAILED: createErrorV2({
    name: 'get_unipile_account_failed',
    type: ErrorType.API_ERROR,
    message: 'Failed to get Unipile account details',
    displayMessage: 'Unable to fetch account details'
  })
};
export interface UnipileAccountDetails {
  id: string;
  type: AccountName;
  status: AccountStatus;
  name: string;
}

export async function getAccountDetails(
  unipileClient: any,
  accountId: string
): Promise<ServiceResponse<UnipileAccountDetails>> {
  try {
    const account = await unipileClient.accounts.getAccountById(accountId);

    if (!account) {
      return { data: null, error: ERRORS.GET_ACCOUNT_FAILED };
    }

    return {
      data: {
        id: account.id,
        type: account.type,
        status: account.status,
        name: account.name
      },
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.GET_ACCOUNT_FAILED, { details: error });
    return { data: null, error: ERRORS.GET_ACCOUNT_FAILED };
  }
}
