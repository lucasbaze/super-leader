import { SupabaseClient } from '@supabase/supabase-js';

import { createTestGroup, createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, simpleSearchPeople } from '../simple-search-people';

describe('searchPeople service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should return latest 30 people when no search term is provided', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create 35 test people
        await Promise.all(
          Array.from({ length: 35 }).map((_, i) =>
            createTestPerson({
              db,
              data: {
                user_id: testUser.id,
                first_name: `Person ${i}`,
                last_name: 'Test',
                bio: 'Test bio'
              }
            })
          )
        );

        const result = await simpleSearchPeople({
          db,
          userId: testUser.id
        });

        expect(result.data).toHaveLength(30);
        expect(result.error).toBeNull();
      });
    });

    it('should find people matching name search and include their groups', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const testPerson1 = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Jennifer',
            last_name: 'Smith',
            bio: 'Developer'
          }
        });

        const testGroup1 = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            slug: 'engineering',
            name: 'Engineering'
          }
        });

        const testGroup2 = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            slug: 'leadership',
            name: 'Leadership'
          }
        });

        // Associate person with groups
        await db.from('group_member').insert([
          { group_id: testGroup1.id, person_id: testPerson1.id },
          { group_id: testGroup2.id, person_id: testPerson1.id }
        ]);

        const result = await simpleSearchPeople({
          db,
          userId: testUser.id,
          searchTerm: 'Jennifer'
        });

        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          id: testPerson1.id,
          first_name: testPerson1.first_name,
          last_name: testPerson1.last_name,
          groups: expect.arrayContaining([
            expect.objectContaining({
              name: 'Engineering',
              slug: 'engineering'
            }),
            expect.objectContaining({
              name: 'Leadership',
              slug: 'leadership'
            })
          ])
        });
      });
    });

    it('should find people matching bio search', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Smith',
            bio: 'Senior Developer'
          }
        });

        const result = await simpleSearchPeople({
          db,
          userId: testUser.id,
          searchTerm: 'Developer'
        });

        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          id: testPerson.id,
          bio: testPerson.bio,
          groups: []
        });
      });
    });
  });

  describe('validation cases', () => {
    it('should return error when userId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await simpleSearchPeople({
          db,
          userId: '',
          searchTerm: 'test'
        });

        expect(result.error).toEqual(ERRORS.SEARCH_PEOPLE.MISSING_USER_ID);
        expect(result.data).toBeNull();
      });
    });
  });

  describe('error cases', () => {
    it('should handle database errors gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        jest.spyOn(db, 'from').mockImplementationOnce(() => {
          throw new Error('Database connection error');
        });

        const result = await simpleSearchPeople({
          db,
          userId: testUser.id,
          searchTerm: 'test'
        });

        expect(result.error).toMatchObject({
          name: ERRORS.SEARCH_PEOPLE.FETCH_ERROR.name,
          type: ERRORS.SEARCH_PEOPLE.FETCH_ERROR.type
        });
        expect(result.data).toBeNull();
      });
    });
  });
});
