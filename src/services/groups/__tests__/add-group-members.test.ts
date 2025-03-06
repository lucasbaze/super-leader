import { SupabaseClient } from '@supabase/supabase-js';

import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { createTestGroup, createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { addGroupMembers, ERRORS } from '../add-group-members';
import { getGroupMembers } from '../get-group-members';

describe('addGroupMembers service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should add new members to a group', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Test Group',
            slug: 'test-group'
          }
        });
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

        const result = await addGroupMembers({
          db,
          groupId: testGroup.id,
          groupSlug: testGroup.slug,
          personIds: [testPerson1.id, testPerson2.id],
          userId: testUser.id
        });

        expect(result.error).toBeNull();

        // Verify members were added
        const { data: members } = await getGroupMembers({
          db,
          id: testGroup.id,
          userId: testUser.id
        });

        expect(members).toHaveLength(2);
        expect(members?.map((m) => m.id).sort()).toEqual([testPerson1.id, testPerson2.id].sort());
      });
    });

    it('should handle duplicate members gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Test Group',
            slug: 'test-group'
          }
        });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        // Add the same person twice
        await addGroupMembers({
          db,
          groupId: testGroup.id,
          groupSlug: testGroup.slug,
          personIds: [testPerson.id],
          userId: testUser.id
        });

        const result = await addGroupMembers({
          db,
          groupId: testGroup.id,
          groupSlug: testGroup.slug,
          personIds: [testPerson.id],
          userId: testUser.id
        });

        expect(result.error).toBeNull();

        // Verify only one membership exists
        const { data: members } = await getGroupMembers({
          db,
          id: testGroup.id,
          userId: testUser.id
        });

        expect(members).toHaveLength(1);
        expect(members![0].id).toBe(testPerson.id);
      });
    });

    it('should handle reserved group membership correctly', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        // Create two reserved groups
        const innerFiveGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Inner Five',
            slug: RESERVED_GROUP_SLUGS.INNER_5
          }
        });

        const centralFiftyGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Central Fifty',
            slug: RESERVED_GROUP_SLUGS.CENTRAL_50
          }
        });

        // Add person to Inner Five
        await addGroupMembers({
          db,
          groupId: innerFiveGroup.id,
          groupSlug: RESERVED_GROUP_SLUGS.INNER_5,
          personIds: [testPerson.id],
          userId: testUser.id
        });

        // Verify person is in Inner Five
        const innerFiveMembers = await getGroupMembers({
          db,
          id: innerFiveGroup.id,
          userId: testUser.id
        });
        expect(innerFiveMembers.data).toHaveLength(1);

        // Now add person to Central Fifty
        await addGroupMembers({
          db,
          groupId: centralFiftyGroup.id,
          groupSlug: RESERVED_GROUP_SLUGS.CENTRAL_50,
          personIds: [testPerson.id],
          userId: testUser.id
        });

        // Verify person is now in Central Fifty
        const centralFiftyMembers = await getGroupMembers({
          db,
          id: centralFiftyGroup.id,
          userId: testUser.id
        });
        expect(centralFiftyMembers.data).toHaveLength(1);

        // Verify person was removed from Inner Five
        const updatedInnerFiveMembers = await getGroupMembers({
          db,
          id: innerFiveGroup.id,
          userId: testUser.id
        });
        expect(updatedInnerFiveMembers.data).toHaveLength(0);
      });
    });

    it('should not affect other group memberships when adding to non-reserved group', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        // Create a reserved group and a regular group
        const innerFiveGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Inner Five',
            slug: RESERVED_GROUP_SLUGS.INNER_5
          }
        });

        const regularGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Regular Group',
            slug: 'regular-group'
          }
        });

        // Add person to Inner Five
        await addGroupMembers({
          db,
          groupId: innerFiveGroup.id,
          groupSlug: innerFiveGroup.slug,
          personIds: [testPerson.id],
          userId: testUser.id
        });

        // Add to regular group
        await addGroupMembers({
          db,
          groupId: regularGroup.id,
          groupSlug: regularGroup.slug,
          personIds: [testPerson.id],
          userId: testUser.id
        });

        // Verify person is still in Inner Five
        const innerFiveMembers = await getGroupMembers({
          db,
          id: innerFiveGroup.id,
          userId: testUser.id
        });
        expect(innerFiveMembers.data).toHaveLength(1);

        // Verify person is also in regular group
        const regularGroupMembers = await getGroupMembers({
          db,
          id: regularGroup.id,
          userId: testUser.id
        });
        expect(regularGroupMembers.data).toHaveLength(1);
      });
    });
  });

  describe('validation cases', () => {
    it('should return error for missing group ID', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await addGroupMembers({
          db,
          groupId: '',
          groupSlug: 'test-group',
          personIds: ['some-id'],
          userId: 'user-id'
        });

        expect(result.error).toEqual(ERRORS.ADD_MEMBERS.MISSING_GROUP_ID);
      });
    });

    it('should return error for empty person IDs array', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await addGroupMembers({
          db,
          groupId: 'group-id',
          groupSlug: 'test-group',
          personIds: [],
          userId: 'user-id'
        });

        expect(result.error).toEqual(ERRORS.ADD_MEMBERS.MISSING_PERSON_IDS);
      });
    });
  });
});
