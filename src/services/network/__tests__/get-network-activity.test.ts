import { addDays, subDays } from 'date-fns';

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

import { ERRORS, getNetworkActivity } from '../get-network-activity';

describe('getNetworkActivity service', () => {
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

        const result = await getNetworkActivity({
          db,
          userId: testUser.id,
          days: 7,
          timezone: 'UTC'
        });

        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          currentPeriod: {
            dates: expect.any(Array),
            inner5: Array(7).fill(0),
            central50: Array(7).fill(0),
            strategic100: Array(7).fill(0),
            everyone: Array(7).fill(0)
          },
          previousPeriod: {
            dates: expect.any(Array),
            inner5: Array(7).fill(0),
            central50: Array(7).fill(0),
            strategic100: Array(7).fill(0),
            everyone: Array(7).fill(0)
          },
          totalActivities: 0
        });
      });
    });

    it('should correctly fetch current and previous period data', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user and reserved groups
        testUser = await createTestUser({ db });
        const groups = await setupReservedGroups(db, testUser.id);

        // Create test people for each group
        const inner5Person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'test_Inner',
            last_name: 'test_Five'
          }
        });

        const central50Person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'test_Central',
            last_name: 'test_Fifty'
          }
        });

        // Add people to their groups
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

        const today = new Date();
        const yesterday = subDays(today, 1);
        const lastWeek = subDays(today, 8);

        // Create interactions for current period
        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: inner5Person.id,
            type: 'meeting',
            note: 'Today interaction',
            created_at: today
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: central50Person.id,
            type: 'meeting',
            note: 'Yesterday interaction',
            created_at: yesterday
          }
        });

        // Create interaction for previous period
        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: inner5Person.id,
            type: 'meeting',
            note: 'Last week interaction',
            created_at: lastWeek
          }
        });

        const result = await getNetworkActivity({
          db,
          userId: testUser.id,
          days: 7,
          timezone: 'UTC'
        });

        expect(result.error).toBeNull();
        expect(result.data).not.toBeNull();

        if (result.data) {
          // Check current period
          expect(result.data.currentPeriod.inner5.reduce((a, b) => a + b)).toBe(1);
          expect(result.data.currentPeriod.central50.reduce((a, b) => a + b)).toBe(1);
          expect(result.data.currentPeriod.strategic100.reduce((a, b) => a + b)).toBe(0);

          // Check previous period
          expect(result.data.previousPeriod.inner5.reduce((a, b) => a + b)).toBe(1);
          expect(result.data.previousPeriod.central50.reduce((a, b) => a + b)).toBe(0);
          expect(result.data.previousPeriod.strategic100.reduce((a, b) => a + b)).toBe(0);

          // Check total activities (only counts current period)
          expect(result.data.totalActivities).toBe(2);
        }
      });
    });

    it('should handle custom period lengths correctly', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user and reserved groups
        testUser = await createTestUser({ db });
        const groups = await setupReservedGroups(db, testUser.id);

        // Create test person
        const person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'test_Custom',
            last_name: 'test_Period'
          }
        });

        await createTestGroupMember({
          db,
          data: {
            group_id: groups.strategic100.id,
            person_id: person.id,
            user_id: testUser.id
          }
        });

        const today = new Date();
        const days3Ago = subDays(today, 3);
        const days7Ago = subDays(today, 7);

        // Create interactions across different periods
        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person.id,
            type: 'meeting',
            note: 'Today interaction',
            created_at: today
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person.id,
            type: 'meeting',
            note: '3 days ago interaction',
            created_at: days3Ago
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: person.id,
            type: 'meeting',
            note: '7 days ago interaction',
            created_at: days7Ago
          }
        });

        const result = await getNetworkActivity({
          db,
          userId: testUser.id,
          days: 4,
          timezone: 'UTC'
        });

        expect(result.error).toBeNull();
        expect(result.data).not.toBeNull();

        if (result.data) {
          // Check current period (should include today and 3 days ago)
          expect(result.data.currentPeriod.strategic100.reduce((a, b) => a + b)).toBe(2);
          expect(result.data.currentPeriod.dates.length).toBe(4);

          // Check previous period (should include 7 days ago)
          expect(result.data.previousPeriod.strategic100.reduce((a, b) => a + b)).toBe(1);
          expect(result.data.previousPeriod.dates.length).toBe(4);

          // Check total activities (only counts current period)
          expect(result.data.totalActivities).toBe(2);
        }
      });
    });

    it('should properly group interactions by reserved group slugs', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user and reserved groups
        testUser = await createTestUser({ db });
        const groups = await setupReservedGroups(db, testUser.id);

        // Create test people for each group and everyone else
        const inner5Person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'test_Inner',
            last_name: 'test_Five'
          }
        });

        const central50Person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'test_Central',
            last_name: 'test_Fifty'
          }
        });

        const strategic100Person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'test_Strategic',
            last_name: 'test_Hundred'
          }
        });

        const everyonePerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'test_Everyone',
            last_name: 'test_Else'
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

        const today = new Date();

        // Create interactions for all people on the same day
        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: inner5Person.id,
            type: 'meeting',
            note: 'Inner5 interaction',
            created_at: today
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: central50Person.id,
            type: 'meeting',
            note: 'Central50 interaction',
            created_at: today
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: strategic100Person.id,
            type: 'meeting',
            note: 'Strategic100 interaction',
            created_at: today
          }
        });

        await createTestInteraction({
          db,
          data: {
            user_id: testUser.id,
            person_id: everyonePerson.id,
            type: 'meeting',
            note: 'Everyone interaction',
            created_at: today
          }
        });

        const result = await getNetworkActivity({
          db,
          userId: testUser.id,
          days: 7,
          timezone: 'UTC'
        });

        expect(result.error).toBeNull();
        expect(result.data).not.toBeNull();

        if (result.data) {
          // Check that interactions are properly grouped
          const todayIndex = result.data.currentPeriod.dates.length - 1;

          // Check counts for today
          expect(result.data.currentPeriod.inner5[todayIndex]).toBe(1);
          expect(result.data.currentPeriod.central50[todayIndex]).toBe(1);
          expect(result.data.currentPeriod.strategic100[todayIndex]).toBe(1);
          expect(result.data.currentPeriod.everyone[todayIndex]).toBe(1);

          // Check total activities
          expect(result.data.totalActivities).toBe(4);
        }
      });
    });
  });

  describe('error cases', () => {
    it('should return error when userId is not provided', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getNetworkActivity({
          db,
          userId: '',
          days: 7,
          timezone: 'UTC'
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.INVALID_USER);
      });
    });

    it('should handle database errors gracefully', async () => {
      // Create a mock that throws an error when rpc is called
      const mockDb = {
        rpc: jest.fn().mockImplementation(() => {
          throw new Error('Database error');
        })
      } as unknown as DBClient;

      const result = await getNetworkActivity({
        db: mockDb,
        userId: 'test-user-id',
        days: 7,
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
