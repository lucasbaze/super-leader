import { SupabaseClient } from '@supabase/supabase-js';

import { createTestGroup, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createUniqueSlug, ERRORS } from '../create-unique-slug';

describe('createUniqueSlug service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should create a basic slug from a name', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await createUniqueSlug({
          db,
          name: 'Test Group',
          table: 'group',
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toBe('test-group');
      });
    });

    it('should handle special characters', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await createUniqueSlug({
          db,
          name: 'Test & Group! @#$',
          table: 'group',
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toBe('test-group');
      });
    });

    it('should create unique slug when duplicate exists', async () => {
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

        const result = await createUniqueSlug({
          db,
          name: 'Test Group',
          table: 'group',
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toBe('test-group-2');
      });
    });

    it('should handle multiple duplicates', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create groups with sequential slugs
        await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Test Group',
            slug: 'test-group',
            icon: '😀'
          }
        });

        await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Test Group 2',
            slug: 'test-group-2',
            icon: '😀'
          }
        });

        const result = await createUniqueSlug({
          db,
          name: 'Test Group',
          table: 'group',
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toBe('test-group-3');
      });
    });
  });

  describe('validation cases', () => {
    it('should return error for missing name', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await createUniqueSlug({
          db,
          name: '',
          table: 'group',
          userId: testUser.id
        });

        expect(result.error).toEqual(ERRORS.CREATE_SLUG.MISSING_NAME);
      });
    });
  });
});
