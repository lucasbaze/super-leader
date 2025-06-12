import { UnipileClient as BaseUnipileClient } from 'unipile-node-sdk';

import { createErrorV2 as createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { ErrorType } from '@/types/errors';

import { UnipileRelationsResponse } from './types';

// Define errors
export const ERRORS = {
  CLIENT_INIT_FAILED: createError({
    name: 'unipile_client_init_failed',
    type: ErrorType.API_ERROR,
    message: 'Failed to initialize Unipile client',
    displayMessage: 'Unable to connect to Unipile at this time'
  }),
  API_ERROR: createError({
    name: 'unipile_api_error',
    type: ErrorType.API_ERROR,
    message: 'Unipile API request failed',
    displayMessage: 'Unable to fetch data from Unipile at this time'
  })
};

// Rate limiting helper
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getClient = () => {
  if (!process.env.UNIPILE_DSN || !process.env.UNIPILE_API_KEY) {
    throw ERRORS.CLIENT_INIT_FAILED;
  }
  return new BaseUnipileClient(`https://${process.env.UNIPILE_DSN}`, process.env.UNIPILE_API_KEY);
};

interface RetryWithBackoffProps<T> {
  maxRetries?: number;
  baseDelay?: number;
}

export async function retryWithBackoff<T>(
  callback: () => Promise<T>,
  { maxRetries = 3, baseDelay = 1000 }: RetryWithBackoffProps<T>
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callback();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  errorLogger.log(ERRORS.API_ERROR, {
    details: lastError
  });
  throw ERRORS.API_ERROR;
}

interface getAllRelationsByAccountIdProps {
  accountId: string;
  limit?: number;
  cursor?: string;
}

export async function getAllRelationsByAccountId({
  accountId,
  limit = 50,
  cursor
}: getAllRelationsByAccountIdProps): Promise<UnipileRelationsResponse | null> {
  const client = getClient();

  return retryWithBackoff(
    async () => {
      const result = await client.users.getAllRelations({
        account_id: accountId,
        limit,
        cursor
      });

      if (!result) {
        return null;
      }

      return {
        relations: result.items,
        next_cursor: result.cursor?.toString() || null,
        has_more: result.cursor !== null
      };
    },
    { maxRetries: 3, baseDelay: 1000 }
  );
}
