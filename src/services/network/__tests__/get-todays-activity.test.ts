import {
  createTestGroup,
  createTestGroupMember,
  createTestInteraction,
  createTestPerson,
  createTestUser
} from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { AuthUser, DBClient } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, getTodaysActivity } from '../get-todays-activity';

describe('getTodaysActivity service', () => {
  let supabase: DBClient;
  let testUser: AuthUser;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should return zero activity when no interactions exist', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user and reserved groups
        testUser = await createTestUser({ db });
        await setupReservedGroups(db, testUser.id);

        const result = await getTodaysActivity({
          db,
          userId: testUser.id,
          timezone: 'UTC'
        });

        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          inner5: { count: 0, people: [] },
          central50: { count: 0, people: [] },
          strategic100: { count: 0, people: [] },
          everyone: { count: 0, people: [] }
        });
      });
    });

    it('should handle multiple interactions within one group', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user and reserved groups
        testUser = await createTestUser({ db });
        const groups = await setupReservedGroups(db, testUser.id);

        // Create two people in inner5
        const person1 = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        const person2 = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Jane',
            last_name: 'Smith'
          }
        });

        // Add both to inner5 group
        await createTestGroupMember({
          db,
          data: {
            group_id: groups.inner5.id,
            person_id: person1.id,
            user_id: testUser.id
          }
        });

        await createTestGroupMember({
          db,
          data: {
            group_id: groups.inner5.id,
            person_id: person2.id,
            user_id: testUser.id
          }
        });

        // Create interactions for both people today
        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person1.id,
            type: 'meeting',
            note: 'Test interaction'
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person2.id,
            type: 'meeting',
            note: 'Test interaction'
          }
        });

        const result = await getTodaysActivity({
          db,
          userId: testUser.id,
          timezone: 'UTC'
        });

        expect(result.error).toBeNull();
        expect(result.data?.inner5).toEqual({
          count: 2,
          people: expect.arrayContaining([
            { name: 'John Doe' },
            { name: 'Jane Smith' }
          ])
        });
        expect(result.data?.central50.count).toBe(0);
        expect(result.data?.strategic100.count).toBe(0);
        expect(result.data?.everyone.count).toBe(0);
      });
    });

    it('should not count interactions from non-reserved groups', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user and reserved groups
        testUser = await createTestUser({ db });
        await setupReservedGroups(db, testUser.id);

        // Create custom group
        const customGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Custom Group',
            slug: 'custom-group'
          }
        });

        const person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Bob',
            last_name: 'Custom'
          }
        });

        await createTestGroupMember({
          db,
          data: {
            group_id: customGroup.id,
            person_id: person.id,
            user_id: testUser.id
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person.id,
            type: 'meeting',
            note: 'Test interaction'
          }
        });

        const result = await getTodaysActivity({
          db,
          userId: testUser.id,
          timezone: 'UTC'
        });

        expect(result.error).toBeNull();
        expect(result.data?.inner5.count).toBe(0);
        expect(result.data?.central50.count).toBe(0);
        expect(result.data?.strategic100.count).toBe(0);
        expect(result.data?.everyone).toEqual({
          count: 1,
          people: [{ name: 'Bob Custom' }]
        });
      });
    });

    it('should handle multiple interactions across different groups', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user and reserved groups
        testUser = await createTestUser({ db });
        const groups = await setupReservedGroups(db, testUser.id);

        // Create and assign people to each group
        const inner5Person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Inner',
            last_name: 'Five'
          }
        });

        const central50Person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Central',
            last_name: 'Fifty'
          }
        });

        const strategic100Person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Strategic',
            last_name: 'Hundred'
          }
        });

        const everyonePerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Every',
            last_name: 'One'
          }
        });

        // Add people to their respective groups
        await createTestGroupMember({
          db,
          data: {
            group_id: groups.inner5.id,
            person_id: inner5Person.id,
            user_id: testUser.id
          }
        });

        await createTestGroupMember({
          db,
          data: {
            group_id: groups.central50.id,
            person_id: central50Person.id,
            user_id: testUser.id
          }
        });

        await createTestGroupMember({
          db,
          data: {
            group_id: groups.strategic100.id,
            person_id: strategic100Person.id,
            user_id: testUser.id
          }
        });

        // Create interactions for all people
        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: inner5Person.id,
            type: 'meeting',
            note: 'Test interaction'
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: central50Person.id,
            type: 'meeting',
            note: 'Test interaction'
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: strategic100Person.id,
            type: 'meeting',
            note: 'Test interaction'
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: everyonePerson.id,
            type: 'meeting',
            note: 'Test interaction'
          }
        });

        const result = await getTodaysActivity({
          db,
          userId: testUser.id,
          timezone: 'UTC'
        });

        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          inner5: {
            count: 1,
            people: [{ name: 'Inner Five' }]
          },
          central50: {
            count: 1,
            people: [{ name: 'Central Fifty' }]
          },
          strategic100: {
            count: 1,
            people: [{ name: 'Strategic Hundred' }]
          },
          everyone: {
            count: 1,
            people: [{ name: 'Every One' }]
          }
        });
      });
    });

    it('should deduplicate people in the results when there are multiple interactions with the same person', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user and reserved groups
        testUser = await createTestUser({ db });
        const groups = await setupReservedGroups(db, testUser.id);

        // Create a person in inner5
        const person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Michael',
            last_name: 'Dedup'
          }
        });

        // Add to inner5 group
        await createTestGroupMember({
          db,
          data: {
            group_id: groups.inner5.id,
            person_id: person.id,
            user_id: testUser.id
          }
        });

        // Create multiple interactions with the same person today
        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person.id,
            type: 'meeting',
            note: 'First interaction'
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person.id,
            type: 'call',
            note: 'Second interaction'
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person.id,
            type: 'email',
            note: 'Third interaction'
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person.id,
            type: 'meeting',
            note: 'Fourth interaction'
          }
        });

        const result = await getTodaysActivity({
          db,
          userId: testUser.id,
          timezone: 'UTC'
        });

        expect(result.error).toBeNull();
        expect(result.data?.inner5).toEqual({
          count: 4,
          people: [{ name: 'Michael Dedup' }]
        });
        expect(result.data?.central50.count).toBe(0);
        expect(result.data?.strategic100.count).toBe(0);
        expect(result.data?.everyone.count).toBe(0);
      });
    });

    it('should correctly count interactions and deduplicate people across different groups', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user and reserved groups
        testUser = await createTestUser({ db });
        const groups = await setupReservedGroups(db, testUser.id);

        // Create two people in inner5
        const person1 = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Michael',
            last_name: 'Multi'
          }
        });

        const person2 = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Kendall',
            last_name: 'Multi'
          }
        });

        // Add both to inner5 group
        await createTestGroupMember({
          db,
          data: {
            group_id: groups.inner5.id,
            person_id: person1.id,
            user_id: testUser.id
          }
        });

        await createTestGroupMember({
          db,
          data: {
            group_id: groups.inner5.id,
            person_id: person2.id,
            user_id: testUser.id
          }
        });

        // Create multiple interactions with person1
        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person1.id,
            type: 'meeting',
            note: 'First interaction'
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person1.id,
            type: 'call',
            note: 'Second interaction'
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person1.id,
            type: 'email',
            note: 'Third interaction'
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person1.id,
            type: 'meeting',
            note: 'Fourth interaction'
          }
        });

        // Create multiple interactions with person2
        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person2.id,
            type: 'meeting',
            note: 'First interaction'
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person2.id,
            type: 'call',
            note: 'Second interaction'
          }
        });

        const result = await getTodaysActivity({
          db,
          userId: testUser.id,
          timezone: 'UTC'
        });

        expect(result.error).toBeNull();
        expect(result.data?.inner5).toEqual({
          count: 6,
          people: expect.arrayContaining([
            { name: 'Michael Multi' },
            { name: 'Kendall Multi' }
          ])
        });
        expect(result.data?.central50.count).toBe(0);
        expect(result.data?.strategic100.count).toBe(0);
        expect(result.data?.everyone.count).toBe(0);
      });
    });
  });

  describe('error cases', () => {
    it('should return error when userId is not provided', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getTodaysActivity({
          db,
          userId: '',
          timezone: 'UTC'
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.INVALID_USER);
      });
    });

    it('should handle database errors gracefully', async () => {
      const mockDb = {
        rpc: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
      } as unknown as DBClient;

      const result = await getTodaysActivity({
        db: mockDb,
        userId: 'test-user-id',
        timezone: 'UTC'
      });

      expect(result.data).toBeNull();
      expect(result.error).toMatchObject(ERRORS.FETCH_FAILED);
    });
  });
});

// Helper function to setup reserved groups
async function setupReservedGroups(db: DBClient, userId: string) {
  const inner5 = await createTestGroup({
    db,
    data: {
      user_id: userId,
      name: 'Inner 5',
      slug: 'inner-5'
    }
  });

  const central50 = await createTestGroup({
    db,
    data: {
      user_id: userId,
      name: 'Central 50',
      slug: 'central-50'
    }
  });

  const strategic100 = await createTestGroup({
    db,
    data: {
      user_id: userId,
      name: 'Strategic 100',
      slug: 'strategic-100'
    }
  });

  return {
    inner5,
    central50,
    strategic100
  };
}
