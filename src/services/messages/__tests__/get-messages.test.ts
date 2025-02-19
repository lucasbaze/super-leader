import { SupabaseClient } from '@supabase/supabase-js';

import { MESSAGE_TYPE } from '@/lib/messages/constants';
import { routes } from '@/lib/routes';
import { createTestGroup } from '@/tests/test-builder/create-group';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createMessage } from '../create-message';
import { INITIAL_MESSAGES } from '../get-initial-message';
import { ERRORS, getMessages } from '../get-messages';
import type { TMessageWithContent } from '../types';

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
                userId: testUser.id
              }
            });
          }

          // Get first page
          const result1 = await getMessages({
            db,
            userId: testUser.id,
            type: MESSAGE_TYPE.HOME,
            limit: 20,
            path: '/'
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
            cursor: result1.data?.nextCursor,
            path: '/'
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
              userId: testUser.id,
              personId: testPerson.id
            }
          });

          // Create test home messages
          await createMessage({
            db,
            data: {
              message: { id: 'test-1', role: 'user', content: 'Home message' },
              type: MESSAGE_TYPE.HOME,
              userId: testUser.id
            }
          });

          const result = await getMessages({
            db,
            userId: testUser.id,
            type: MESSAGE_TYPE.PERSON,
            personId: testPerson.id,
            path: '/person/[id]'
          });

          expect(result.error).toBeNull();
          expect(result.data?.messages).toHaveLength(1);
          expect(result.data?.messages[0].person_id).toBe(testPerson.id);
        });
      });

      it('should return initial messages when no messages exist', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testPerson = await createTestPerson({
            db,
            data: { user_id: testUser.id, first_name: 'John', last_name: 'Doe' }
          });

          const result = await getMessages({
            db,
            userId: testUser.id,
            type: MESSAGE_TYPE.PERSON,
            personId: testPerson.id,
            path: routes.person.byId({ id: testPerson.id })
          });

          expect(result.error).toBeNull();
          expect(result.data?.messages).toHaveLength(2); // Initial messages for person
          expect(result.data?.hasMore).toBe(false);
          expect(
            result.data?.messages.some((msg) =>
              (msg.message as TMessageWithContent)?.content?.includes('John')
            )
          ).toBeTruthy();
        });
      });

      it('should fetch messages for a specific group', async () => {
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

          // Create test group message
          await createMessage({
            db,
            data: {
              message: { id: 'test-1', role: 'user', content: 'Group message' },
              type: MESSAGE_TYPE.GROUP,
              userId: testUser.id,
              groupId: testGroup.id
            }
          });

          // Create test home message (to ensure filtering works)
          await createMessage({
            db,
            data: {
              message: { id: 'test-2', role: 'user', content: 'Home message' },
              type: MESSAGE_TYPE.HOME,
              userId: testUser.id
            }
          });

          const result = await getMessages({
            db,
            userId: testUser.id,
            type: MESSAGE_TYPE.GROUP,
            groupId: testGroup.id,
            path: routes.groups.byId({ id: testGroup.id })
          });

          expect(result.error).toBeNull();
          expect(result.data?.messages).toHaveLength(1);
          expect(result.data?.messages[0].group_id).toBe(testGroup.id);
          expect((result.data?.messages[0].message as TMessageWithContent)?.content).toBe(
            'Group message'
          );
        });
      });
    });

    describe('error cases', () => {
      it('should return error for missing user ID', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await getMessages({
            db,
            userId: '',
            type: MESSAGE_TYPE.HOME,
            path: routes.home()
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.MISSING_USER_ID);
        });
      });
    });
  });
});
