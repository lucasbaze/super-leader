import { SupabaseClient } from '@supabase/supabase-js';
import { getPeople } from '../get-people';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { ServiceErrorType } from '@/types/service-response';
import { createClient } from '@/utils/supabase/server';


describe('getPeople service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should return empty array when user has no people', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const result = await getPeople({ db, userId: testUser.id });

        expect(result.data).toEqual([]);
        expect(result.error).toBeUndefined();
      });
    });

    it('should return people when user has created them', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        // Create test people
        const testPerson1 = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        const testPerson2 = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Jane',
            last_name: 'Smith'
          }
        });

        const result = await getPeople({ db, userId: testUser.id });

        expect(result.data).toHaveLength(2);
        expect(result.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: testPerson1.id,
              first_name: 'test_John',
              last_name: 'test_Doe'
            }),
            expect.objectContaining({
              id: testPerson2.id,
              first_name: 'test_Jane',
              last_name: 'test_Smith'
            })
          ])
        );
        expect(result.error).toBeUndefined();
      });
    });

    it('should only return people for the specified user', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testUser2 = await createTestUser({ db });
        // Create a person for our test user
        await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        // Create a person for another user
        await createTestPerson({
          db,
          data: {
            user_id: testUser2.id,
            first_name: 'Jane',
            last_name: 'Smith'
          }
        });

        const result = await getPeople({ db, userId: testUser.id });

        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          first_name: 'test_John',
          last_name: 'test_Doe'
        });
      });
    });
  });

  describe('error cases', () => {
    it('should handle database errors gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getPeople({ db, userId: 'invalid-id' });

        expect(result.error).toBeDefined();
        expect(result.error).toEqual({
          type: ServiceErrorType.DATABASE_ERROR,
          message: 'Failed to fetch people',
          details: expect.any(Object)
        });
        expect(result.data).toBeNull();
      });
    });
  });
});
