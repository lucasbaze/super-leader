import { SupabaseClient } from '@supabase/supabase-js';

import { randomString } from '@/lib/utils';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { ACCOUNT_NAMES, ACCOUNT_STATUS, AUTH_STATUS } from '@/types/custom';
import { createClient } from '@/utils/supabase/server';

import { createIntegratedAccount } from '../unipile/create-integrated-account';
import { deleteIntegratedAccount, ERRORS } from '../unipile/delete-integrated-account';

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
          accountName: ACCOUNT_NAMES.LINKEDIN,
          accountStatus: ACCOUNT_STATUS.ACTIVE,
          authStatus: AUTH_STATUS.OK
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
          account_name: ACCOUNT_NAMES.LINKEDIN,
          account_status: ACCOUNT_STATUS.ACTIVE,
          auth_status: AUTH_STATUS.OK
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

    it('should handle database errors gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Try to delete with invalid data to trigger a database error
        const result = await deleteIntegratedAccount({
          db,
          accountId: null as any // This will cause a database error
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.DELETE_FAILED);
      });
    });
  });
});
