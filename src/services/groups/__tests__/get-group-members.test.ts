import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

import {
  createTestGroup,
  createTestGroupMember,
  createTestPerson,
  createTestUser
} from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, getGroupMembers } from '../get-group-members';

describe('getGroupMembers service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should return empty array when group has no members', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Inner 5',
            slug: 'inner-5'
          }
        });

        const result = await getGroupMembers({
          db,
          userId: testUser.id,
          id: testGroup.id
        });

        expect(result.data).toEqual([]);
        expect(result.error).toBeNull();
      });
    });

    it('should return people when group has members', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Inner 5',
            slug: 'inner-5'
          }
        });

        // Create test people and add them to group
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

        await createTestGroupMember({
          db,
          data: {
            group_id: testGroup.id,
            person_id: testPerson1.id,
            user_id: testUser.id
          }
        });

        await createTestGroupMember({
          db,
          data: {
            group_id: testGroup.id,
            person_id: testPerson2.id,
            user_id: testUser.id
          }
        });

        const result = await getGroupMembers({
          db,
          userId: testUser.id,
          id: testGroup.id
        });

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

    it('should only return members for the specified group and user', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testUser2 = await createTestUser({ db });

        const testGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Inner 5',
            slug: 'inner-5'
          }
        });

        const testGroup2 = await createTestGroup({
          db,
          data: {
            user_id: testUser2.id,
            name: 'Inner 5',
            slug: 'inner-5'
          }
        });

        // Create a person and add to first user's group
        const testPerson1 = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        await createTestGroupMember({
          db,
          data: {
            group_id: testGroup.id,
            person_id: testPerson1.id,
            user_id: testUser.id
          }
        });

        // Create a person and add to second user's group
        const testPerson2 = await createTestPerson({
          db,
          data: {
            user_id: testUser2.id,
            first_name: 'Jane',
            last_name: 'Smith'
          }
        });

        await createTestGroupMember({
          db,
          data: {
            group_id: testGroup2.id,
            person_id: testPerson2.id,
            user_id: testUser2.id
          }
        });

        const result = await getGroupMembers({
          db,
          userId: testUser.id,
          id: testGroup.id
        });

        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          first_name: 'John',
          last_name: 'Doe'
        });
      });
    });
  });

  describe('validation cases', () => {
    it('should return error when userId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getGroupMembers({
          db,
          userId: '',
          id: randomUUID()
        });

        expect(result.error).toBeDefined();
        expect(result.error).toEqual(ERRORS.GROUP_MEMBERS.MISSING_USER_ID);
        expect(result.data).toBeNull();
      });
    });

    it('should return error when id is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const result = await getGroupMembers({
          db,
          userId: testUser.id,
          // @ts-expect-error - This is a test
          id: null
        });

        expect(result.error).toBeDefined();
        expect(result.error).toEqual(ERRORS.GROUP_MEMBERS.MISSING_ID);
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

        const result = await getGroupMembers({
          db,
          userId: testUser.id,
          id: randomUUID()
        });

        expect(result.error).toBeDefined();
        expect(result.error).toMatchObject({
          name: ERRORS.GROUP_MEMBERS.FETCH_ERROR.name,
          type: ERRORS.GROUP_MEMBERS.FETCH_ERROR.type,
          displayMessage: ERRORS.GROUP_MEMBERS.FETCH_ERROR.displayMessage
        });
        expect(result.data).toBeNull();
      });
    });
  });
});
