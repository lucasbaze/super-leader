import { SupabaseClient } from '@supabase/supabase-js';

import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { accountNames, accountStatuses, authStatuses } from '@/types/custom';
import { createClient } from '@/utils/supabase/server';

import { createIntegratedAccount, ERRORS } from '../unipile/create-integrated-account';

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
            accountName: accountNames.LINKEDIN,
            accountStatus: accountStatuses[0],
            authStatus: authStatuses[0]
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            user_id: testUser.id,
            account_id: 'test-account-123',
            account_name: accountNames.LINKEDIN,
            account_status: accountStatuses[0],
            auth_status: authStatuses[0]
          });
        });
      });

      it('should create accounts for all valid account types', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          for (const accountName of Object.values(accountNames)) {
            const result = await createIntegratedAccount({
              db,
              userId: testUser.id,
              accountId: `test-account-${accountName}`,
              accountName,
              accountStatus: accountStatuses[0],
              authStatus: authStatuses[0]
            });

            expect(result.error).toBeNull();
            expect(result.data?.account_name).toBe(accountName);
          }
        });
      });

      it.each(accountStatuses)('should create accounts with account status %s', async (accountStatus) => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          await Promise.all(
            authStatuses.map(async (authStatus) => {
              const result = await createIntegratedAccount({
                db,
                userId: testUser.id,
                accountId: `test-account-${accountStatus}-${authStatus}`,
                accountName: accountNames.LINKEDIN,
                accountStatus,
                authStatus
              });

              expect(result.error).toBeNull();
              expect(result.data?.account_status).toBe(accountStatus);
              expect(result.data?.auth_status).toBe(authStatus);
            })
          );
        });
      });
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
            accountStatus: accountStatuses[0],
            authStatus: authStatuses[0]
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
            accountName: accountNames.LINKEDIN,
            accountStatus: 'INVALID_STATUS' as any,
            authStatus: authStatuses[0]
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
            accountName: accountNames.LINKEDIN,
            accountStatus: accountStatuses[0],
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
            accountName: accountNames.LINKEDIN,
            accountStatus: accountStatuses[0],
            authStatus: authStatuses[0]
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.CREATE_FAILED);
        });
      });
    });
  });
});
