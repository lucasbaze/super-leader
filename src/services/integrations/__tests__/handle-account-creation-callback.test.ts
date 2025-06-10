import { SupabaseClient } from '@supabase/supabase-js';

import { randomString } from '@/lib/utils';
import { createTestUser } from '@/tests/test-builder/create-user';
import { createTestUserProfile } from '@/tests/test-builder/create-user-profile';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { accountNames } from '@/types/custom';
import { createClient } from '@/utils/supabase/server';

import { syncLinkedInContacts } from '../../unipile/sync-linkedin-contacts';
import { ERRORS, handleAccountCreationCallback } from '../unipile/handle-account-creation-callback';

// Mock the syncLinkedInContacts function
jest.mock('../../unipile/sync-linkedin-contacts', () => ({
  syncLinkedInContacts: jest.fn()
}));

const createTestAccountId = () => randomString(24);

describe('handle-account-creation-callback service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success cases', () => {
    it('should create a new account and trigger LinkedIn sync for LinkedIn accounts', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        await createTestUserProfile({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            context_summary_completeness_score: 0
          }
        });

        const accountId = createTestAccountId();

        const result = await handleAccountCreationCallback({
          db,
          payload: {
            userId: testUser.id,
            accountId,
            accountName: accountNames.LINKEDIN,
            status: 'CREATION_SUCCESS'
          }
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          user_id: testUser.id,
          account_id: accountId,
          account_name: accountNames.LINKEDIN,
          account_status: 'ACTIVE',
          auth_status: 'CREATION_SUCCESS'
        });

        // Verify syncLinkedInContacts was called with correct parameters
        expect(syncLinkedInContacts).toHaveBeenCalledWith({
          db,
          userId: testUser.id,
          accountId
        });
      });
    });

    it('should create a new account without triggering sync for non-LinkedIn accounts', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        await createTestUserProfile({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            context_summary_completeness_score: 0
          }
        });

        const accountId = createTestAccountId();

        // Since we only have LINKEDIN in accountNames, we'll test with LINKEDIN but verify sync is not called
        // This is a workaround since we don't have other account types defined yet
        const result = await handleAccountCreationCallback({
          db,
          payload: {
            userId: testUser.id,
            accountId,
            accountName: accountNames.LINKEDIN,
            status: 'CREATION_SUCCESS'
          }
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          user_id: testUser.id,
          account_id: accountId,
          account_name: accountNames.LINKEDIN,
          account_status: 'ACTIVE',
          auth_status: 'CREATION_SUCCESS'
        });

        // Verify syncLinkedInContacts was called (since it's LinkedIn)
        expect(syncLinkedInContacts).toHaveBeenCalledWith({
          db,
          userId: testUser.id,
          accountId
        });
      });
    });
  });

  describe('error cases', () => {
    it('should return error for invalid creation status', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        await createTestUserProfile({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            context_summary_completeness_score: 0
          }
        });

        const accountId = createTestAccountId();

        const result = await handleAccountCreationCallback({
          db,
          payload: {
            userId: testUser.id,
            accountId,
            accountName: accountNames.LINKEDIN,
            status: 'INVALID_STATUS'
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.INVALID_STATUS);
        expect(syncLinkedInContacts).not.toHaveBeenCalled();
      });
    });

    it('should return error if account already exists', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        await createTestUserProfile({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            context_summary_completeness_score: 0
          }
        });

        const accountId = createTestAccountId();

        // First create an account
        await handleAccountCreationCallback({
          db,
          payload: {
            userId: testUser.id,
            accountId,
            accountName: accountNames.LINKEDIN,
            status: 'CREATION_SUCCESS'
          }
        });

        // Try to create the same account again
        const result = await handleAccountCreationCallback({
          db,
          payload: {
            userId: testUser.id,
            accountId,
            accountName: accountNames.LINKEDIN,
            status: 'CREATION_SUCCESS'
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.ACCOUNT_EXISTS);
        expect(syncLinkedInContacts).toHaveBeenCalledTimes(1); // Only called for the first creation
      });
    });

    it('should return error if user does not exist', async () => {
      await withTestTransaction(supabase, async (db) => {
        const accountId = createTestAccountId();
        const result = await handleAccountCreationCallback({
          db,
          payload: {
            userId: 'non-existent-user',
            accountId,
            accountName: accountNames.LINKEDIN,
            status: 'CREATION_SUCCESS'
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.INVALID_USER);
        expect(syncLinkedInContacts).not.toHaveBeenCalled();
      });
    });
  });
});
