import { SupabaseClient } from '@supabase/supabase-js';

import {
  MESSAGE_ROLE,
  MESSAGE_TOOL_INVOCATION_STATE,
  MESSAGE_TYPE
} from '@/lib/messages/constants';
import { createTestGroup } from '@/tests/test-builder/create-group';
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

  describe('createMessage', () => {
    describe('success cases', () => {
      it('should create a new user message for a person', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testPerson = await createTestPerson({
            db,
            data: { user_id: testUser.id, first_name: 'John', last_name: 'Doe' }
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
              type: MESSAGE_TYPE.PERSON,
              userId: testUser.id,
              personId: testPerson.id
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            message: messageData,
            type: MESSAGE_TYPE.PERSON,
            person_id: testPerson.id
          });
        });
      });

      it('should create a new user message for a group', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testGroup = await createTestGroup({
            db,
            data: { user_id: testUser.id, name: 'Test Group', slug: 'test-group' }
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
              type: MESSAGE_TYPE.GROUP,
              userId: testUser.id,
              groupId: testGroup.id
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            message: messageData,
            type: MESSAGE_TYPE.GROUP,
            group_id: testGroup.id
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
              type: MESSAGE_TYPE.PERSON,
              userId: testUser.id,
              personId: testPerson.id
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            message: messageData,
            type: MESSAGE_TYPE.PERSON,
            person_id: testPerson.id
          });
          expect(result.data!.message.toolInvocations?.[0].toolName).toBe('createInteraction');
        });
      });

      it('should store assistant message with error tool invocation', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testPerson = await createTestPerson({
            db,
            data: { user_id: testUser.id, first_name: 'Michael', last_name: 'Orcutt' }
          });

          const messageData = {
            id: 'msg-wqaE2gULHtdWjdEMIKTMzkES',
            role: MESSAGE_ROLE.ASSISTANT,
            content: '',
            toolInvocations: [
              {
                state: MESSAGE_TOOL_INVOCATION_STATE.RESULT,
                toolCallId: 'call_6IP8cSNBn15nYAdFAQErWxLO',
                toolName: 'createMessageSuggestionsFromArticleForUser',
                args: {
                  content: 'I heard about the termite infestation at your house...',
                  person_id: testPerson.id
                },
                result: {
                  error: true,
                  message:
                    'Hmm... I encountered an issue while trying to create message suggestions.',
                  details: '{}'
                }
              }
            ],
            revisionId: 'V37hGeVfRvbPvyzk'
          };

          const result = await createMessage({
            db,
            data: {
              message: messageData,
              type: MESSAGE_TYPE.PERSON,
              userId: testUser.id,
              personId: testPerson.id
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            message: messageData,
            type: MESSAGE_TYPE.PERSON,
            person_id: testPerson.id
          });
          expect(result.data!.message.toolInvocations?.[0].result?.error).toBe(true);
        });
      });

      it('should create a simple assistant response message', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testPerson = await createTestPerson({
            db,
            data: { user_id: testUser.id, first_name: 'Michael', last_name: 'Orcutt' }
          });

          const messageData = {
            id: 'msg-C2H5z1sQ6H6bZxzANSaPkfUy',
            role: MESSAGE_ROLE.ASSISTANT,
            content:
              "Michael's last name is Orcutt. How can I assist you further with Michael Orcutt?",
            revisionId: 'HL4tmABdU94jBz4o'
          };

          const result = await createMessage({
            db,
            data: {
              message: messageData,
              type: MESSAGE_TYPE.PERSON,
              userId: testUser.id,
              personId: testPerson.id
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            message: messageData,
            type: MESSAGE_TYPE.PERSON,
            person_id: testPerson.id
          });
        });
      });
    });

    describe('error cases', () => {
      it('should return error for missing message content', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await createMessage({
            db,
            data: {
              // @ts-expect-error - This is a test
              message: null,
              type: MESSAGE_TYPE.HOME,
              userId: 'some-id'
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.INVALID_MESSAGE);
        });
      });
    });
  });
});
