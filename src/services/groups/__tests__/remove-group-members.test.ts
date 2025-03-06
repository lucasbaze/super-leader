import { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

import { createTestGroup, createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { addGroupMembers } from '../add-group-members';
import { getGroupMembers } from '../get-group-members';
import { ERRORS, removeGroupMembers } from '../remove-group-members';

describe('removeGroupMembers service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should remove members from a group', async () => {
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

        // First add the members
        await addGroupMembers({
          db,
          groupId: testGroup.id,
          groupSlug: testGroup.slug,
          personIds: [testPerson1.id, testPerson2.id],
          userId: testUser.id
        });

        // Verify members were added
        const { data: membersBefore } = await getGroupMembers({
          db,
          id: testGroup.id,
          userId: testUser.id
        });
        expect(membersBefore).toHaveLength(2);

        // Remove one member
        const result = await removeGroupMembers({
          db,
          groupId: testGroup.id,
          personIds: [testPerson1.id],
          userId: testUser.id
        });

        expect(result.error).toBeNull();

        // Verify member was removed
        const { data: membersAfter } = await getGroupMembers({
          db,
          id: testGroup.id,
          userId: testUser.id
        });

        expect(membersAfter).toHaveLength(1);
        expect(membersAfter![0].id).toBe(testPerson2.id);
      });
    });

    it('should handle removing multiple members at once', async () => {
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
        const testPerson3 = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Bob',
            last_name: 'Johnson'
          }
        });

        // First add the members
        await addGroupMembers({
          db,
          groupId: testGroup.id,
          groupSlug: testGroup.slug,
          personIds: [testPerson1.id, testPerson2.id, testPerson3.id],
          userId: testUser.id
        });

        // Remove two members
        const result = await removeGroupMembers({
          db,
          groupId: testGroup.id,
          personIds: [testPerson1.id, testPerson2.id],
          userId: testUser.id
        });

        expect(result.error).toBeNull();

        // Verify only one member remains
        const { data: membersAfter } = await getGroupMembers({
          db,
          id: testGroup.id,
          userId: testUser.id
        });

        expect(membersAfter).toHaveLength(1);
        expect(membersAfter![0].id).toBe(testPerson3.id);
      });
    });

    it('should handle removing non-existent members gracefully', async () => {
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

        // First add the member
        await addGroupMembers({
          db,
          groupId: testGroup.id,
          groupSlug: testGroup.slug,
          personIds: [testPerson.id],
          userId: testUser.id
        });

        // Try to remove a non-existent member
        const result = await removeGroupMembers({
          db,
          groupId: testGroup.id,
          personIds: [randomUUID()],
          userId: testUser.id
        });

        expect(result.error).toBeNull();

        // Verify original member is still in the group
        const { data: membersAfter } = await getGroupMembers({
          db,
          id: testGroup.id,
          userId: testUser.id
        });

        expect(membersAfter).toHaveLength(1);
        expect(membersAfter![0].id).toBe(testPerson.id);
      });
    });
  });

  describe('validation cases', () => {
    it('should return error for missing group ID', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await removeGroupMembers({
          db,
          groupId: '',
          personIds: ['some-id'],
          userId: 'user-id'
        });

        expect(result.error).toEqual(ERRORS.REMOVE_MEMBERS.MISSING_GROUP_ID);
      });
    });

    it('should return error for empty person IDs array', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await removeGroupMembers({
          db,
          groupId: 'group-id',
          personIds: [],
          userId: 'user-id'
        });

        expect(result.error).toEqual(ERRORS.REMOVE_MEMBERS.MISSING_PERSON_IDS);
      });
    });
  });
});
