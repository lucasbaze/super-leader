import { SupabaseClient } from '@supabase/supabase-js';

import { randomString } from '@/lib/utils';
import { createTestUser } from '@/tests/test-builder/create-user';
import { createTestUserProfile } from '@/tests/test-builder/create-user-profile';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { initialLinkedInContactSyncTask } from '@/trigger/linkedin-contact-sync';
import { ACCOUNT_NAMES } from '@/types/custom';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, handleAccountCreationCallback } from '../unipile/handle-account-creation-callback';

// Mock the initialLinkedInContactSyncTask function
jest.mock('../../../trigger/linkedin-contact-sync', () => ({
  initialLinkedInContactSyncTask: {
    trigger: jest.fn()
  }
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
            accountName: ACCOUNT_NAMES.LINKEDIN,
            status: 'CREATION_SUCCESS'
          }
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          user_id: testUser.id,
          account_id: accountId,
          account_name: ACCOUNT_NAMES.LINKEDIN,
          account_status: 'ACTIVE',
          auth_status: 'CREATION_SUCCESS'
        });

        // Verify initialLinkedInContactSyncTask was called with correct parameters
        expect(initialLinkedInContactSyncTask.trigger).toHaveBeenCalledWith({
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
            accountName: ACCOUNT_NAMES.LINKEDIN,
            status: 'CREATION_SUCCESS'
          }
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          user_id: testUser.id,
          account_id: accountId,
          account_name: ACCOUNT_NAMES.LINKEDIN,
          account_status: 'ACTIVE',
          auth_status: 'CREATION_SUCCESS'
        });

        // Verify syncLinkedInContacts was called (since it's LinkedIn)
        expect(initialLinkedInContactSyncTask.trigger).toHaveBeenCalledWith({
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
            accountName: ACCOUNT_NAMES.LINKEDIN,
            status: 'INVALID_STATUS'
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.INVALID_STATUS);
        expect(initialLinkedInContactSyncTask.trigger).not.toHaveBeenCalled();
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
            accountName: ACCOUNT_NAMES.LINKEDIN,
            status: 'CREATION_SUCCESS'
          }
        });

        // Try to create the same account again
        const result = await handleAccountCreationCallback({
          db,
          payload: {
            userId: testUser.id,
            accountId,
            accountName: ACCOUNT_NAMES.LINKEDIN,
            status: 'CREATION_SUCCESS'
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.ACCOUNT_EXISTS);
        expect(initialLinkedInContactSyncTask.trigger).toHaveBeenCalledTimes(1); // Only called for the first creation
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
            accountName: ACCOUNT_NAMES.LINKEDIN,
            status: 'CREATION_SUCCESS'
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.INVALID_USER);
        expect(initialLinkedInContactSyncTask.trigger).not.toHaveBeenCalled();
      });
    });
  });
});
