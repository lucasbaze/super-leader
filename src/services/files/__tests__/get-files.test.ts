import { SupabaseClient } from '@supabase/supabase-js';

import { createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createFile } from '../create-file';
import { ERRORS, getFiles } from '../get-files';

describe('getFiles service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should return empty array when user has no files', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await getFiles({ db, userId: testUser.id });

        expect(result.data).toEqual([]);
        expect(result.error).toBeNull();
      });
    });

    it('should return files when user has uploaded files', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create test files
        const file1 = await createFile({
          db,
          data: {
            name: 'contacts.csv',
            path: 'uploads/contacts.csv',
            user_id: testUser.id
          }
        });

        const file2 = await createFile({
          db,
          data: {
            name: 'leads.csv',
            path: 'uploads/leads.csv',
            user_id: testUser.id
          }
        });

        const result = await getFiles({ db, userId: testUser.id });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(2);
        expect(result.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: file1.data!.id,
              name: 'contacts.csv',
              path: 'uploads/contacts.csv',
              user_id: testUser.id
            }),
            expect.objectContaining({
              id: file2.data!.id,
              name: 'leads.csv',
              path: 'uploads/leads.csv',
              user_id: testUser.id
            })
          ])
        );
      });
    });

    it('should only return files for the specified user', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser1 = await createTestUser({ db });
        const testUser2 = await createTestUser({ db });

        // Create file for first user
        await createFile({
          db,
          data: {
            name: 'user1-file.csv',
            path: 'uploads/user1-file.csv',
            user_id: testUser1.id
          }
        });

        // Create file for second user
        await createFile({
          db,
          data: {
            name: 'user2-file.csv',
            path: 'uploads/user2-file.csv',
            user_id: testUser2.id
          }
        });

        const result = await getFiles({ db, userId: testUser1.id });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          name: 'user1-file.csv',
          user_id: testUser1.id
        });
      });
    });

    it('should return files ordered by creation date (most recent first)', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create files with slight delay to ensure different timestamps
        const file1 = await createFile({
          db,
          data: {
            name: 'first.csv',
            path: 'uploads/first.csv',
            user_id: testUser.id
          }
        });

        // Small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 10));

        const file2 = await createFile({
          db,
          data: {
            name: 'second.csv',
            path: 'uploads/second.csv',
            user_id: testUser.id
          }
        });

        const result = await getFiles({ db, userId: testUser.id });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(2);
        // Most recent should be first
        expect(result.data![0].name).toBe('second.csv');
        expect(result.data![1].name).toBe('first.csv');
      });
    });
  });

  describe('validation cases', () => {
    it('should return error when userId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getFiles({ db, userId: '' });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.FILES.MISSING_USER_ID.name,
          type: ERRORS.FILES.MISSING_USER_ID.type,
          displayMessage: ERRORS.FILES.MISSING_USER_ID.displayMessage
        });
      });
    });

    it('should return error when userId is undefined', async () => {
      await withTestTransaction(supabase, async (db) => {
        // @ts-expect-error - Testing runtime validation
        const result = await getFiles({ db, userId: undefined });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.FILES.MISSING_USER_ID.name,
          type: ERRORS.FILES.MISSING_USER_ID.type,
          displayMessage: ERRORS.FILES.MISSING_USER_ID.displayMessage
        });
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

        const result = await getFiles({ db, userId: testUser.id });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.FILES.FETCH_ERROR.name,
          type: ERRORS.FILES.FETCH_ERROR.type,
          displayMessage: ERRORS.FILES.FETCH_ERROR.displayMessage
        });
      });
    });

    it('should handle database query errors gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Mock a database error response
        const mockFrom = jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Query failed', code: 'PGRST100' }
          })
        });

        jest.spyOn(db, 'from').mockImplementation(mockFrom);

        const result = await getFiles({ db, userId: testUser.id });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.FILES.FETCH_ERROR.name,
          type: ERRORS.FILES.FETCH_ERROR.type,
          displayMessage: ERRORS.FILES.FETCH_ERROR.displayMessage
        });
      });
    });
  });
});
