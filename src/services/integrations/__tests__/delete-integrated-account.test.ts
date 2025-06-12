import { SupabaseClient } from '@supabase/supabase-js';

import { randomString } from '@/lib/utils';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { INTEGRATION_ACCOUNT_NAME, INTEGRATION_ACCOUNT_STATUS, INTEGRATION_AUTH_STATUS } from '@/types/custom';
import { createClient } from '@/utils/supabase/server';

import { createIntegratedAccount } from '../create-integrated-account';
import { deleteIntegratedAccount, ERRORS } from '../delete-integrated-account';

describe('delete-integrated-account service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should delete an existing account', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const accountId = randomString(24);

        // First create an account
        const { data: createdAccount } = await createIntegratedAccount({
          db,
          userId: testUser.id,
          accountId,
          accountName: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
          accountStatus: INTEGRATION_ACCOUNT_STATUS.ACTIVE,
          authStatus: INTEGRATION_AUTH_STATUS.OK
        });

        // Then delete it
        const result = await deleteIntegratedAccount({
          db,
          accountId
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          user_id: testUser.id,
          account_id: accountId,
          account_name: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
          account_status: INTEGRATION_ACCOUNT_STATUS.ACTIVE,
          auth_status: INTEGRATION_AUTH_STATUS.OK
        });

        // Verify the account is actually deleted
        const { data: deletedAccount } = await db
          .from('integrated_accounts')
          .select()
          .eq('account_id', accountId)
          .single();

        expect(deletedAccount).toBeNull();
      });
    });
  });

  describe('error cases', () => {
    it('should return error when account does not exist', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await deleteIntegratedAccount({
          db,
          accountId: 'non-existent-account'
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.ACCOUNT_NOT_FOUND);
      });
    });
  });
});
