import { SupabaseClient } from '@supabase/supabase-js';

import { randomString } from '@/lib/utils';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { INTEGRATION_ACCOUNT_NAME, INTEGRATION_ACCOUNT_STATUS, INTEGRATION_AUTH_STATUS } from '@/types/custom';
import { createClient } from '@/utils/supabase/server';

import { createIntegratedAccount } from '../create-integrated-account';
import { ERRORS, handleAccountWebhook } from '../handle-account-webhook';

describe('handle-account-webhook service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should update account status when status differs', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const accountId = randomString(24);

        // First create an account with OK status
        await createIntegratedAccount({
          db,
          userId: testUser.id,
          accountId,
          accountName: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
          accountStatus: INTEGRATION_ACCOUNT_STATUS.ACTIVE,
          authStatus: INTEGRATION_AUTH_STATUS.OK
        });

        // Then update it via webhook
        const result = await handleAccountWebhook({
          db,
          payload: {
            AccountStatus: {
              account_id: accountId,
              account_type: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
              message: INTEGRATION_AUTH_STATUS.CREDENTIALS
            }
          }
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          user_id: testUser.id,
          account_id: accountId,
          account_name: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
          account_status: INTEGRATION_ACCOUNT_STATUS.ACTIVE,
          auth_status: INTEGRATION_AUTH_STATUS.CREDENTIALS
        });
      });
    });

    it('should not update account when status is the same', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const accountId = randomString(24);
        // First create an account with OK status
        await createIntegratedAccount({
          db,
          userId: testUser.id,
          accountId,
          accountName: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
          accountStatus: INTEGRATION_ACCOUNT_STATUS.ACTIVE,
          authStatus: INTEGRATION_AUTH_STATUS.OK
        });

        // Then try to update it with the same status
        const result = await handleAccountWebhook({
          db,
          payload: {
            AccountStatus: {
              account_id: accountId,
              account_type: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
              message: INTEGRATION_AUTH_STATUS.OK
            }
          }
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          user_id: testUser.id,
          account_id: accountId,
          account_name: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
          account_status: INTEGRATION_ACCOUNT_STATUS.ACTIVE,
          auth_status: INTEGRATION_AUTH_STATUS.OK
        });
      });
    });
  });

  describe('error cases', () => {
    it('should return error when account does not exist', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await handleAccountWebhook({
          db,
          payload: {
            AccountStatus: {
              account_id: 'non-existent-account',
              account_type: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
              message: INTEGRATION_AUTH_STATUS.OK
            }
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.ACCOUNT_NOT_FOUND);
      });
    });
  });
});
