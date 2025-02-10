import { SupabaseClient } from '@supabase/supabase-js';

import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { DEFAULT_GROUPS, ERRORS, setupNewUser } from '../setup-new-user';

describe('setupNewUser', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('setups a new user', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Setup groups for the user
        const result = await setupNewUser({
          db,
          userId: testUser.id
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toBe(true);

        // Verify groups were created in the database
        const { data: groups } = await db.from('group').select('*').eq('user_id', testUser.id);

        expect(groups).toHaveLength(DEFAULT_GROUPS.length);
      });
    });
  });

  describe('error cases', () => {
    it('handles invalid user ID', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await setupNewUser({
          db,
          userId: ''
        });

        expect(result.error).toEqual(ERRORS.INVALID_USER);
        expect(result.data).toBeNull();
      });
    });
  });
});
