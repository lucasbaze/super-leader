import { SupabaseClient } from '@supabase/supabase-js';

import { MESSAGE_ROLE, MESSAGE_TOOL_INVOCATION_STATE } from '@/lib/messages/constants';
import { createConversation } from '@/services/conversations/create-conversation';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createMessage, ERRORS } from '../create-message';

describe('message-service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should create a new user message in a conversation', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create a conversation for the person
        const conversation = await createConversation({
          db,
          userId: testUser.id,
          name: 'Test Conversation'
        });

        const messageData = {
          id: '14gQiicMKRggMyox',
          role: MESSAGE_ROLE.USER,
          content: 'Add a note to John about his recent project completion.'
        };

        const result = await createMessage({
          db,
          data: {
            message: messageData,
            conversationId: conversation.data.id,
            userId: testUser.id
          }
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          message: messageData,
          conversation_id: conversation.data.id,
          user_id: testUser.id
        });
      });
    });

    it('should create a new assistant message with tool invocations', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: { user_id: testUser.id, first_name: 'Michael', last_name: 'Orcutt' }
        });

        // Create a conversation for the person
        const conversation = await createConversation({
          db,
          userId: testUser.id,
          name: 'Test Conversation'
        });

        const messageData = {
          id: 'msg-UORyBkXYfVxO9gXOnVrFlvTT',
          role: MESSAGE_ROLE.ASSISTANT,
          content: '',
          toolInvocations: [
            {
              state: MESSAGE_TOOL_INVOCATION_STATE.RESULT,
              toolCallId: 'call_1IA0JVueKqad7vu0sxHhVfhz',
              toolName: 'createInteraction',
              args: {
                person_id: testPerson.id,
                type: 'note',
                note: 'Michael recently dealt with a termite infestation in his house, which he has successfully cleaned up.',
                person_name: 'Michael Orcutt'
              },
              result: 'Yes'
            }
          ],
          revisionId: 'Xgfv63czwZTlPn83'
        };

        const result = await createMessage({
          db,
          data: {
            message: messageData,
            conversationId: conversation.data.id,
            userId: testUser.id
          }
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          message: {
            id: 'msg-UORyBkXYfVxO9gXOnVrFlvTT',
            role: MESSAGE_ROLE.ASSISTANT,
            content: '',
            toolInvocations: [
              {
                state: MESSAGE_TOOL_INVOCATION_STATE.RESULT,
                toolCallId: 'call_1IA0JVueKqad7vu0sxHhVfhz',
                toolName: 'createInteraction',
                args: expect.any(Object),
                result: 'Yes'
              }
            ],
            revisionId: 'Xgfv63czwZTlPn83'
          },
          conversation_id: conversation.data.id,
          user_id: testUser.id
        });
      });
    });

    it('should create a new message in a root conversation', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create a root conversation
        const conversation = await createConversation({
          db,
          userId: testUser.id,
          name: 'Test Conversation'
        });

        const messageData = {
          id: 'msg-root-test',
          role: MESSAGE_ROLE.USER,
          content: 'This is a message in the root conversation'
        };

        const result = await createMessage({
          db,
          data: {
            message: messageData,
            conversationId: conversation.data.id,
            userId: testUser.id
          }
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          message: messageData,
          conversation_id: conversation.data.id,
          user_id: testUser.id
        });
      });
    });
  });

  describe('error cases', () => {
    it('should return an error if message is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const conversation = await createConversation({
          db,
          userId: testUser.id,
          name: 'Test Conversation'
        });

        const result = await createMessage({
          db,
          data: {
            // @ts-ignore - Testing invalid input
            message: null,
            conversationId: conversation.data.id,
            userId: testUser.id
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.INVALID_MESSAGE);
      });
    });

    it('should return an error if conversationId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const messageData = {
          id: 'msg-test-error',
          role: MESSAGE_ROLE.USER,
          content: 'Test message'
        };

        const result = await createMessage({
          db,
          data: {
            message: messageData,
            // @ts-ignore - Testing invalid input
            conversationId: null,
            userId: testUser.id
          }
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.MISSING_CONVERSATION_ID);
      });
    });
  });
});
