import { SupabaseClient } from '@supabase/supabase-js';

import { CONVERSATION_OWNER_TYPES } from '@/services/conversations/constants';
import { createConversation } from '@/services/conversations/create-conversation';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createMessage } from '../create-message';
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

          // Create a conversation
          const conversation = await createConversation({
            db,
            userId: testUser.id,
            name: 'Test Conversation',
            ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
            ownerIdentifier: 'home'
          });

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
                conversationId: conversation.data.id,
                userId: testUser.id
              }
            });
          }

          // Get first page
          const result1 = await getMessages({
            db,
            userId: testUser.id,
            conversationId: conversation.data.id,
            limit: 20
          });

          expect(result1.error).toBeNull();
          expect(result1.data?.messages).toHaveLength(20);
          expect(result1.data?.hasMore).toBe(true);

          // Get second page
          const result2 = await getMessages({
            db,
            userId: testUser.id,
            conversationId: conversation.data.id,
            limit: 10,
            cursor: result1.data?.nextCursor
          });

          expect(result2.error).toBeNull();
          expect(result2.data?.messages).toHaveLength(5);
          expect(result2.data?.hasMore).toBe(false);
        });
      });

      it('should return empty array when no messages exist', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          // Create a conversation
          const conversation = await createConversation({
            db,
            userId: testUser.id,
            name: 'Empty Conversation',
            ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
            ownerIdentifier: 'home'
          });

          // Get messages
          const result = await getMessages({
            db,
            userId: testUser.id,
            conversationId: conversation.data.id
          });

          expect(result.error).toBeNull();
          expect(result.data?.messages).toHaveLength(0);
          expect(result.data?.hasMore).toBe(false);
        });
      });
    });

    describe('error cases', () => {
      it('should return an error if userId is missing', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const conversation = await createConversation({
            db,
            userId: testUser.id,
            name: 'Test Conversation',
            ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
            ownerIdentifier: 'home'
          });

          const result = await getMessages({
            db,
            userId: '',
            conversationId: conversation.data.id
          });

          expect(result.data).toBeNull();
          expect(result.error).toEqual(ERRORS.MISSING_USER_ID);
        });
      });

      it('should return an error if conversationId is missing', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await getMessages({
            db,
            userId: testUser.id,
            // @ts-ignore - Testing invalid input
            conversationId: ''
          });

          expect(result.data).toBeNull();
          expect(result.error).toEqual(ERRORS.MISSING_CONVERSATION_ID);
        });
      });
    });
  });
});
