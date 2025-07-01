import { SupabaseClient } from '@supabase/supabase-js';

import { createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createFile, ERRORS } from '../create-file';

describe('createFile service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should create a file record successfully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const fileData = {
          name: 'test-file.csv',
          path: 'uploads/test-file.csv',
          user_id: testUser.id
        };

        const result = await createFile({
          db,
          data: fileData
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data).toMatchObject({
          name: 'test-file.csv',
          path: 'uploads/test-file.csv',
          user_id: testUser.id
        });
        expect(result.data!.id).toBeDefined();
        expect(result.data!.created_at).toBeDefined();
      });
    });

    it('should create multiple file records for the same user', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const fileData1 = {
          name: 'file1.csv',
          path: 'uploads/file1.csv',
          user_id: testUser.id
        };

        const fileData2 = {
          name: 'file2.csv',
          path: 'uploads/file2.csv',
          user_id: testUser.id
        };

        const result1 = await createFile({ db, data: fileData1 });
        const result2 = await createFile({ db, data: fileData2 });

        expect(result1.error).toBeNull();
        expect(result2.error).toBeNull();
        expect(result1.data!.name).toBe('file1.csv');
        expect(result2.data!.name).toBe('file2.csv');
        expect(result1.data!.id).not.toBe(result2.data!.id);
      });
    });
  });

  describe('validation cases', () => {
    it('should return error when name is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await createFile({
          db,
          data: {
            name: '',
            path: 'uploads/test-file.csv',
            user_id: testUser.id
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.FILES.VALIDATION_ERROR.name,
          type: ERRORS.FILES.VALIDATION_ERROR.type,
          displayMessage: ERRORS.FILES.VALIDATION_ERROR.displayMessage
        });
      });
    });

    it('should return error when path is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await createFile({
          db,
          data: {
            name: 'test-file.csv',
            path: '',
            user_id: testUser.id
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.FILES.VALIDATION_ERROR.name,
          type: ERRORS.FILES.VALIDATION_ERROR.type,
          displayMessage: ERRORS.FILES.VALIDATION_ERROR.displayMessage
        });
      });
    });

    it('should return error when user_id is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await createFile({
          db,
          data: {
            name: 'test-file.csv',
            path: 'uploads/test-file.csv',
            user_id: ''
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.FILES.VALIDATION_ERROR.name,
          type: ERRORS.FILES.VALIDATION_ERROR.type,
          displayMessage: ERRORS.FILES.VALIDATION_ERROR.displayMessage
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

        const result = await createFile({
          db,
          data: {
            name: 'test-file.csv',
            path: 'uploads/test-file.csv',
            user_id: testUser.id
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.FILES.CREATE_FAILED.name,
          type: ERRORS.FILES.CREATE_FAILED.type,
          displayMessage: ERRORS.FILES.CREATE_FAILED.displayMessage
        });
      });
    });

    it('should handle invalid user_id gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await createFile({
          db,
          data: {
            name: 'test-file.csv',
            path: 'uploads/test-file.csv',
            user_id: 'invalid-user-id'
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.FILES.CREATE_FAILED.name,
          type: ERRORS.FILES.CREATE_FAILED.type,
          displayMessage: ERRORS.FILES.CREATE_FAILED.displayMessage
        });
      });
    });
  });
});
