import { SupabaseClient } from '@supabase/supabase-js';

import { MESSAGE_TYPE } from '@/lib/messages/constants';
import { createTestGroup } from '@/tests/test-builder/create-group';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createMessage } from '../create-message';
import { ERRORS, getMessages, getMessagesForGroup, getMessagesForPerson } from '../get-messages';

describe('get-messages-service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('getMessages', () => {
    describe('success cases', () => {
      it('should fetch messages with pagination', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          // Create 25 test messages
          for (let i = 0; i < 25; i++) {
            await createMessage({
              db,
              data: {
                message: {
                  id: `test-${i}`,
                  role: 'user',
                  content: `Test message ${i}`
                },
                type: MESSAGE_TYPE.HOME,
                user_id: testUser.id
              }
            });
          }

          // Get first page
          const result1 = await getMessages({
            db,
            userId: testUser.id,
            type: MESSAGE_TYPE.HOME,
            limit: 20
          });

          expect(result1.error).toBeNull();
          expect(result1.data?.messages).toHaveLength(20);
          expect(result1.data?.hasMore).toBe(true);

          // Get second page
          const result2 = await getMessages({
            db,
            userId: testUser.id,
            type: MESSAGE_TYPE.HOME,
            limit: 20,
            cursor: result1.data?.nextCursor
          });

          expect(result2.error).toBeNull();
          expect(result2.data?.messages).toHaveLength(5);
          expect(result2.data?.hasMore).toBe(false);
          expect(result2.data?.nextCursor).toBeUndefined();
        });
      });

      it('should fetch messages for a specific person', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testPerson = await createTestPerson({
            db,
            data: { user_id: testUser.id, first_name: 'John', last_name: 'Doe' }
          });

          // Create test messages
          await createMessage({
            db,
            data: {
              message: { id: 'test-1', role: 'user', content: 'Person message' },
              type: MESSAGE_TYPE.PERSON,
              user_id: testUser.id,
              person_id: testPerson.id
            }
          });

          // Create test home messages
          await createMessage({
            db,
            data: {
              message: { id: 'test-1', role: 'user', content: 'Home message' },
              type: MESSAGE_TYPE.HOME,
              user_id: testUser.id
            }
          });

          const result = await getMessagesForPerson({
            db,
            userId: testUser.id,
            personId: testPerson.id
          });

          expect(result.error).toBeNull();
          expect(result.data?.messages).toHaveLength(1);
          expect(result.data?.messages[0].person_id).toBe(testPerson.id);
        });
      });

      it('should handle empty messages without error', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testPerson = await createTestPerson({
            db,
            data: { user_id: testUser.id, first_name: 'John', last_name: 'Doe' }
          });
          const testGroup = await createTestGroup({
            db,
            data: { user_id: testUser.id, name: 'Test Group', slug: 'test-group' }
          });

          const homeResult = await getMessages({
            db,
            userId: testUser.id,
            type: MESSAGE_TYPE.HOME
          });

          expect(homeResult.error).toBeNull();
          expect(homeResult.data).toMatchObject({
            messages: [],
            hasMore: false,
            nextCursor: undefined
          });

          const personResult = await getMessagesForPerson({
            db,
            userId: testUser.id,
            personId: testPerson.id
          });

          expect(personResult.error).toBeNull();
          expect(personResult.data).toMatchObject({
            messages: [],
            hasMore: false,
            nextCursor: undefined
          });

          const groupResult = await getMessagesForGroup({
            db,
            userId: testUser.id,
            groupId: testGroup.id
          });

          expect(groupResult.error).toBeNull();
          expect(groupResult.data).toMatchObject({
            messages: [],
            hasMore: false,
            nextCursor: undefined
          });
        });
      });
    });

    describe('error cases', () => {
      it('should return error for missing user ID', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await getMessages({
            db,
            userId: '',
            type: MESSAGE_TYPE.HOME
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.MISSING_USER_ID);
        });
      });
    });
  });
});
