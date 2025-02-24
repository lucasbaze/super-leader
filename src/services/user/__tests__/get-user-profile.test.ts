import { SupabaseClient } from '@supabase/supabase-js';

import { createTestUser, createTestUserProfile } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, getUserProfile } from '../get-user-profile';

describe('getUserProfile service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should return user profile when it exists', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const testProfile = await createTestUserProfile({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Test',
            last_name: 'User'
          }
        });

        const result = await getUserProfile({ db, userId: testUser.id });

        expect(result.data).toMatchObject({
          id: testProfile.id,
          user_id: testUser.id,
          first_name: 'Test',
          last_name: 'User'
        });
        expect(result.error).toBeNull();
      });
    });
  });

  describe('error cases', () => {
    it('returns fetch error when profile does not exist', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const result = await getUserProfile({ db, userId: testUser.id });

        expect(result.error?.name).toEqual(ERRORS.USER_PROFILE.FETCH_ERROR.name);
        expect(result.data).toBeNull();
        expect(result.error?.details).toMatchObject({
          code: 'PGRST116',
          message: 'JSON object requested, multiple (or no) rows returned'
        });
      });
    });

    it('handles missing user ID', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getUserProfile({ db, userId: '' });

        expect(result.error).toEqual(ERRORS.USER_PROFILE.MISSING_USER_ID);
        expect(result.data).toBeNull();
      });
    });
  });
});
