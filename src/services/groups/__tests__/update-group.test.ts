import { SupabaseClient } from '@supabase/supabase-js';

import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { createTestGroup, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { getGroups } from '../get-groups';
import { ERRORS, updateGroup } from '../update-group';

describe('updateGroup service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should update both name and icon', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Test Group',
            slug: 'test-group',
            icon: '😀'
          }
        });

        const result = await updateGroup({
          db,
          groupId: testGroup.id,
          name: 'Updated Group',
          icon: '🚀',
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testGroup.id,
          name: 'Updated Group',
          slug: 'updated-group',
          icon: '🚀'
        });
      });
    });

    it('should update only name', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Test Group',
            slug: 'test-group',
            icon: '😀'
          }
        });

        const result = await updateGroup({
          db,
          groupId: testGroup.id,
          name: 'Updated Group',
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testGroup.id,
          name: 'Updated Group',
          slug: 'updated-group',
          icon: '😀' // Icon unchanged
        });
      });
    });

    it('should update only icon', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Test Group',
            slug: 'test-group',
            icon: '😀'
          }
        });

        const result = await updateGroup({
          db,
          groupId: testGroup.id,
          icon: '🚀',
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testGroup.id,
          name: 'Test Group',
          slug: 'test-group', // Slug unchanged
          icon: '🚀'
        });
      });
    });

    it('should handle duplicate names by creating unique slug', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create first group
        await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Test Group',
            slug: 'test-group',
            icon: '😀'
          }
        });

        // Create second group
        const secondGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Another Group',
            slug: 'another-group',
            icon: '😊'
          }
        });

        // Try to update second group with same name as first
        const result = await updateGroup({
          db,
          groupId: secondGroup.id,
          name: 'Test Group',
          icon: '🎉',
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: secondGroup.id,
          name: 'Test Group',
          slug: 'test-group-2',
          icon: '🎉'
        });
      });
    });
  });

  describe('validation cases', () => {
    it('should return error when no changes provided', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Test Group',
            slug: 'test-group',
            icon: '😀'
          }
        });

        const result = await updateGroup({
          db,
          groupId: testGroup.id,
          userId: testUser.id
        });

        expect(result.error).toEqual(ERRORS.UPDATE_GROUP.NO_CHANGES);
        expect(result.data).toBeNull();
      });
    });

    it('should not allow updating reserved groups', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const reservedGroup = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Inner Five',
            slug: RESERVED_GROUP_SLUGS.INNER_5,
            icon: '😀'
          }
        });

        const result = await updateGroup({
          db,
          groupId: reservedGroup.id,
          name: 'New Name',
          icon: '🎉',
          userId: testUser.id
        });

        expect(result.error).toEqual(ERRORS.UPDATE_GROUP.RESERVED_GROUP);
        expect(result.data).toBeNull();
      });
    });

    it('should return error for missing required fields', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await updateGroup({
          db,
          groupId: '',
          name: 'Test',
          icon: '😀',
          userId: 'user-id'
        });

        expect(result.error).toEqual(ERRORS.UPDATE_GROUP.MISSING_ID);
        expect(result.data).toBeNull();
      });
    });
  });
});
