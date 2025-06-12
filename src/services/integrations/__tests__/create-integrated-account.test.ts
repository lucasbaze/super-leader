import { SupabaseClient } from '@supabase/supabase-js';

import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { INTEGRATION_ACCOUNT_NAME, INTEGRATION_ACCOUNT_STATUS, INTEGRATION_AUTH_STATUS } from '@/types/custom';
import { createClient } from '@/utils/supabase/server';

import { createIntegratedAccount, ERRORS } from '../create-integrated-account';

describe('integrated-account service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('createIntegratedAccount', () => {
    describe('success cases', () => {
      it('should create a new integrated account', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await createIntegratedAccount({
            db,
            userId: testUser.id,
            accountId: 'test-account-123',
            accountName: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
            accountStatus: INTEGRATION_ACCOUNT_STATUS.ACTIVE,
            authStatus: INTEGRATION_AUTH_STATUS.OK
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            user_id: testUser.id,
            account_id: 'test-account-123',
            account_name: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
            account_status: INTEGRATION_ACCOUNT_STATUS.ACTIVE,
            auth_status: INTEGRATION_AUTH_STATUS.OK
          });
        });
      });

      it('should create accounts for all valid account types', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          for (const accountName of Object.values(INTEGRATION_ACCOUNT_NAME)) {
            const result = await createIntegratedAccount({
              db,
              userId: testUser.id,
              accountId: `test-account-${accountName}`,
              accountName,
              accountStatus: INTEGRATION_ACCOUNT_STATUS.ACTIVE,
              authStatus: INTEGRATION_AUTH_STATUS.OK
            });

            expect(result.error).toBeNull();
            expect(result.data?.account_name).toBe(accountName);
          }
        });
      });

      it.each(Object.values(INTEGRATION_ACCOUNT_STATUS))(
        'should create accounts with account status %s',
        async (accountStatus) => {
          await withTestTransaction(supabase, async (db) => {
            const testUser = await createTestUser({ db });

            await Promise.all(
              Object.values(INTEGRATION_AUTH_STATUS).map(async (authStatus) => {
                const result = await createIntegratedAccount({
                  db,
                  userId: testUser.id,
                  accountId: `test-account-${accountStatus}-${authStatus}`,
                  accountName: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
                  accountStatus,
                  authStatus
                });

                expect(result.error).toBeNull();
                expect(result.data?.account_status).toBe(accountStatus);
                expect(result.data?.auth_status).toBe(authStatus);
              })
            );
          });
        }
      );
    });

    describe('error cases', () => {
      it('should return error for invalid account name', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await createIntegratedAccount({
            db,
            userId: testUser.id,
            accountId: 'test-account-123',
            accountName: 'INVALID_ACCOUNT' as any,
            accountStatus: INTEGRATION_ACCOUNT_STATUS.ACTIVE,
            authStatus: INTEGRATION_AUTH_STATUS.OK
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_FAILED);
        });
      });

      it('should return error for invalid account status', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await createIntegratedAccount({
            db,
            userId: testUser.id,
            accountId: 'test-account-123',
            accountName: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
            accountStatus: 'INVALID_STATUS' as any,
            authStatus: INTEGRATION_AUTH_STATUS.OK
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_FAILED);
        });
      });

      it('should return error for invalid auth status', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await createIntegratedAccount({
            db,
            userId: testUser.id,
            accountId: 'test-account-123',
            accountName: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
            accountStatus: INTEGRATION_ACCOUNT_STATUS.ACTIVE,
            authStatus: 'INVALID_AUTH' as any
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_FAILED);
        });
      });

      it('should handle database errors', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await createIntegratedAccount({
            db,
            userId: 'invalid-uuid',
            accountId: 'test-account-123',
            accountName: INTEGRATION_ACCOUNT_NAME.LINKEDIN,
            accountStatus: INTEGRATION_ACCOUNT_STATUS.ACTIVE,
            authStatus: INTEGRATION_AUTH_STATUS.OK
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.CREATE_FAILED);
        });
      });
    });
  });
});
