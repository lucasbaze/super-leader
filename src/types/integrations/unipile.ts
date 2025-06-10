import { type UnipileClient } from 'unipile-node-sdk';
import { z } from 'zod';

import { AccountName, accountNames, AccountStatus, AuthStatus } from '@/types/custom';
import { DBClient } from '@/types/database';

// https://developer.unipile.com/docs/account-lifecycle
export const unipileAccountStatusWebhookSchema = z.object({
  account_id: z.string(),
  account_type: z.string(),
  message: z.string() // This will be the AuthStatus value
});

export const unipileAccountCreationCallbackSchema = z.object({
  userId: z.string(),
  accountId: z.string(),
  accountName: z.nativeEnum(accountNames),
  status: z.string()
});

export type UnipileWebhookPayload = z.infer<typeof unipileAccountStatusWebhookSchema>;
export type UnipileCreationCallbackPayload = z.infer<typeof unipileAccountCreationCallbackSchema>;

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

export interface HandleAccountCreationCallbackParams {
  db: DBClient;
  payload: UnipileCreationCallbackPayload;
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
