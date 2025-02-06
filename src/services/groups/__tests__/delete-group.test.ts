import { SupabaseClient } from '@supabase/supabase-js';

import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { createTestGroup, createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { addGroupMembers } from '../add-group-members';
import { deleteGroup, ERRORS } from '../delete-group';
import { getGroupMembers } from '../get-group-members';
import { getGroups } from '../get-groups';

describe('deleteGroup service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should delete a group and its members', async () => {
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

        // Add a member to the group
        await addGroupMembers({
          db,
          groupId: testGroup.id,
          groupSlug: testGroup.slug,
          personIds: [testPerson.id],
          userId: testUser.id
        });

        // Delete the group
        const result = await deleteGroup({
          db,
          groupId: testGroup.id,
          userId: testUser.id
        });

        expect(result.error).toBeNull();

        // Verify group was deleted
        const { data: groups } = await getGroups({
          db,
          userId: testUser.id
        });
        expect(groups).toHaveLength(0);

        // Verify members were deleted
        const { data: members } = await getGroupMembers({
          db,
          slug: testGroup.slug,
          userId: testUser.id
        });
        expect(members).toHaveLength(0);
      });
    });
  });

  describe('validation cases', () => {
    it('should not allow deleting reserved groups', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const reservedGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Inner Five',
            slug: RESERVED_GROUP_SLUGS.INNER_5
          }
        });

        const result = await deleteGroup({
          db,
          groupId: reservedGroup.id,
          userId: testUser.id
        });

        expect(result.error).toEqual(ERRORS.DELETE_GROUP.RESERVED_GROUP);

        // Verify group still exists
        const { data: groups } = await getGroups({
          db,
          userId: testUser.id
        });
        expect(groups).toHaveLength(1);
      });
    });

    it('should return error for missing group ID', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await deleteGroup({
          db,
          groupId: '',
          userId: 'user-id'
        });

        expect(result.error).toEqual(ERRORS.DELETE_GROUP.MISSING_ID);
      });
    });
  });
});
