import { createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { DBClient } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

import { createUserContext } from '../create-user-context';
import { ERRORS, getUserContext } from '../get-user-context';

describe('context-service', () => {
  let supabase: DBClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('getUserContext', () => {
    describe('success cases', () => {
      it('should fetch user context records', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          // Create some test context records
          await createUserContext({
            db,
            data: {
              user_id: testUser.id,
              content: 'User mentioned they enjoy hiking on weekends',
              reason: 'Hobby information'
            }
          });

          await createUserContext({
            db,
            data: {
              user_id: testUser.id,
              content: 'User has a dog named Max',
              reason: 'Pet information'
            }
          });

          // Fetch the context records
          const result = await getUserContext({
            db,
            userId: testUser.id
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(2);
          expect(result.data?.map((c) => c.content)).toContain('User mentioned they enjoy hiking on weekends');
          expect(result.data?.map((c) => c.content)).toContain('User has a dog named Max');
        });
      });

      it('should respect the limit parameter', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          // Create 3 test context records
          await createUserContext({
            db,
            data: {
              user_id: testUser.id,
              content: 'First context record',
              reason: 'First context record'
            }
          });

          await createUserContext({
            db,
            data: {
              user_id: testUser.id,
              content: 'Second context record',
              reason: 'Second context record'
            }
          });

          await createUserContext({
            db,
            data: {
              user_id: testUser.id,
              content: 'Third context record',
              reason: 'Third context record'
            }
          });

          // Fetch with limit of 2
          const result = await getUserContext({
            db,
            userId: testUser.id,
            limit: 2
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(2);
        });
      });

      it.skip('should filter by processed status', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          // Create processed and unprocessed records
          await createUserContext({
            db,
            data: {
              user_id: testUser.id,
              content: 'Processed record',
              reason: 'Processed record'
              // processed: true
            }
          });

          await createUserContext({
            db,
            data: {
              user_id: testUser.id,
              content: 'Unprocessed record',
              reason: 'Unprocessed record'
              // processed: false
            }
          });

          // Fetch only processed records
          const processedResult = await getUserContext({
            db,
            userId: testUser.id,
            processed: true
          });

          expect(processedResult.error).toBeNull();
          expect(processedResult.data).toHaveLength(1);
          expect(processedResult.data?.[0].content).toBe('Processed record');

          // Fetch only unprocessed records
          const unprocessedResult = await getUserContext({
            db,
            userId: testUser.id
            // processed: false
          });

          expect(unprocessedResult.error).toBeNull();
          expect(unprocessedResult.data).toHaveLength(1);
          expect(unprocessedResult.data?.[0].content).toBe('Unprocessed record');
        });
      });
    });

    describe('error cases', () => {
      it('should return error for missing user ID', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await getUserContext({
            db,
            userId: ''
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.INVALID_USER);
        });
      });
    });
  });
});
