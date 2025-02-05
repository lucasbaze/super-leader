import { SupabaseClient } from '@supabase/supabase-js';

import { createTestGroup, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, getGroups } from '../get-groups';

describe('getGroups service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should return empty array when user has no groups', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const result = await getGroups({ db, userId: testUser.id });

        expect(result.data).toEqual([]);
        expect(result.error).toBeNull();
      });
    });

    it('should return groups when user has created them', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const testGroup1 = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Group A',
            slug: 'group-a'
          }
        });

        const testGroup2 = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Group B',
            slug: 'group-b'
          }
        });

        const result = await getGroups({ db, userId: testUser.id });

        expect(result.data).toHaveLength(2);
        expect(result.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: testGroup1.id,
              name: 'test_Group A',
              slug: 'group-a'
            }),
            expect.objectContaining({
              id: testGroup2.id,
              name: 'test_Group B',
              slug: 'group-b'
            })
          ])
        );
        expect(result.error).toBeNull();
      });
    });

    it('should only return groups for the specified user', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser1 = await createTestUser({ db });
        const testUser2 = await createTestUser({ db });

        await createTestGroup({
          db,
          data: {
            user_id: testUser1.id,
            name: 'User 1 Group',
            slug: 'user-1-group'
          }
        });

        await createTestGroup({
          db,
          data: {
            user_id: testUser2.id,
            name: 'User 2 Group',
            slug: 'user-2-group'
          }
        });

        const result = await getGroups({ db, userId: testUser1.id });

        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          name: 'test_User 1 Group',
          slug: 'user-1-group'
        });
      });
    });
  });

  describe('validation cases', () => {
    it('should return error when userId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getGroups({ db, userId: '' });

        expect(result.error).toBeDefined();
        expect(result.error).toEqual(ERRORS.GROUPS.MISSING_USER_ID);
        expect(result.data).toBeNull();
      });
    });
  });

  describe('error cases', () => {
    it('should handle database errors gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Mock the database query to throw an error
        jest.spyOn(db, 'from').mockImplementationOnce(() => {
          throw new Error('Database connection error');
        });

        const result = await getGroups({ db, userId: testUser.id });

        expect(result.error).toBeDefined();
        expect(result.error).toMatchObject({
          name: ERRORS.GROUPS.FETCH_ERROR.name,
          type: ERRORS.GROUPS.FETCH_ERROR.type,
          displayMessage: ERRORS.GROUPS.FETCH_ERROR.displayMessage
        });
        expect(result.data).toBeNull();
      });
    });
  });
});
