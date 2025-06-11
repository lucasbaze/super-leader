import { type UnipileClient } from 'unipile-node-sdk';
import { z } from 'zod';

import { ACCOUNT_NAMES, AccountName, AccountStatus, AuthStatus } from '@/types/custom';
import { DBClient } from '@/types/database';

// https://developer.unipile.com/docs/account-lifecycle
export const unipileAccountStatusWebhookSchema = z.object({
  account_id: z.string(),
  account_type: z.string(),
  message: z.string() // This will be the AuthStatus value
});

export type UnipileWebhookPayload = z.infer<typeof unipileAccountStatusWebhookSchema>;

export interface UnipileAccountDetails {
  id: string;
  type: AccountName;
  status: AccountStatus;
  name: string;
}

export interface HandleAccountWebhookParams {
  db: DBClient;
  payload: UnipileWebhookPayload;
  unipileClient: UnipileClient;
}

// https://developer.unipile.com/docs/account-lifecycle
export interface CreateIntegratedAccountParams {
  db: DBClient;
  userId: string;
  accountId: string;
  accountName: AccountName;
  accountStatus: AccountStatus;
  authStatus: AuthStatus;
}

export interface UpdateIntegratedAccountParams {
  db: DBClient;
  accountId: string;
  authStatus: AuthStatus;
  accountStatus?: AccountStatus;
}
