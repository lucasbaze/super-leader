import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, getPeople } from '../get-people';

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
        console.log(result.error);
        expect(result.error).toBeNull();
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
              first_name: 'John',
              last_name: 'Doe'
            }),
            expect.objectContaining({
              id: testPerson2.id,
              first_name: 'Jane',
              last_name: 'Smith'
            })
          ])
        );
        expect(result.error).toBeNull();
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
          first_name: 'John',
          last_name: 'Doe'
        });
      });
    });
  });

  describe('error cases', () => {
    it('should handle database errors gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getPeople({ db, userId: 'invalid-id' });

        expect(result.error).toBeDefined();
        expect(result.error).toEqual(ERRORS.PEOPLE.FETCH_ERROR);
        expect(result.data).toBeNull();
      });
    });
  });
});
