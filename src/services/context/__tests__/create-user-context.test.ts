import { createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { DBClient } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

import { createUserContext, ERRORS } from '../create-user-context';
import { getUserContext } from '../get-user-context';

describe('context-service', () => {
  let supabase: DBClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('createUserContext', () => {
    describe('success cases', () => {
      it('should create a new user context record with minimal data', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await createUserContext({
            db,
            data: {
              user_id: testUser.id,
              content: 'User mentioned they enjoy hiking on weekends',
              reason: 'User mentioned they enjoy hiking on weekends'
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            user_id: testUser.id,
            content: 'User mentioned they enjoy hiking on weekends',
            processed: false
          });

          // Verify using getUserContext
          const getResult = await getUserContext({
            db,
            userId: testUser.id
          });

          expect(getResult.error).toBeNull();
          expect(getResult.data).toHaveLength(1);
          expect(getResult.data?.[0].content).toBe('User mentioned they enjoy hiking on weekends');
        });
      });

      it('should create a user context record with all fields', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await createUserContext({
            db,
            data: {
              user_id: testUser.id,
              content: 'User has three children aged 5, 8, and 12',
              reason: 'Family information',
              processed: true
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            user_id: testUser.id,
            content: 'User has three children aged 5, 8, and 12',
            reason: 'Family information',
            processed: true
          });

          // Verify using getUserContext with processed filter
          const getResult = await getUserContext({
            db,
            userId: testUser.id,
            processed: true
          });

          expect(getResult.error).toBeNull();
          expect(getResult.data).toHaveLength(1);
          expect(getResult.data?.[0].content).toBe('User has three children aged 5, 8, and 12');
        });
      });
    });

    describe('error cases', () => {
      it('should return error for missing content', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await createUserContext({
            db,
            // @ts-expect-error - reason is required
            data: {
              user_id: testUser.id,
              content: ''
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.INVALID_CONTENT);
        });
      });

      it('should return error for missing user_id', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await createUserContext({
            db,
            data: {
              user_id: '',
              content: 'Some content',
              reason: 'Some reason'
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.INVALID_USER);
        });
      });
    });
  });
});
