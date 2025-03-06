import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { CONVERSATION_OWNER_TYPES } from '../constants';
import { createConversation } from '../create-conversation';
import { ERRORS, getConversations } from '../get-conversations';

describe('getConversations', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should get conversations for a specific owner type and identifier', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create a test user
        const user = await createTestUser({ db });

        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: user.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });
        // Create some conversations
        await createConversation({
          db,
          userId: user.id,
          name: 'Conversation 1',
          ownerType: CONVERSATION_OWNER_TYPES.PERSON,
          ownerIdentifier: testPerson.id
        });

        await createConversation({
          db,
          userId: user.id,
          name: 'Conversation 2',
          ownerType: CONVERSATION_OWNER_TYPES.PERSON,
          ownerIdentifier: testPerson.id
        });

        // Create a conversation for a different owner type
        await createConversation({
          db,
          userId: user.id,
          name: 'Conversation 3',
          ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
          ownerIdentifier: 'network-route'
        });
        // Get conversations
        const result = await getConversations({
          db,
          userId: user.id,
          ownerType: CONVERSATION_OWNER_TYPES.PERSON,
          ownerIdentifier: testPerson.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(2);
        expect(result.data[0].name).toBe('Conversation 2'); // Most recent first
        expect(result.data[1].name).toBe('Conversation 1');
      });
    });

    it('should respect the limit parameter', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user = await createTestUser({ db });

        // Create 3 conversations
        await createConversation({
          db,
          userId: user.id,
          name: 'Conversation 1',
          ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
          ownerIdentifier: 'network-route'
        });

        await createConversation({
          db,
          userId: user.id,
          name: 'Conversation 2',
          ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
          ownerIdentifier: 'network-route'
        });

        await createConversation({
          db,
          userId: user.id,
          name: 'Conversation 3',
          ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
          ownerIdentifier: 'network-route'
        });

        // Get conversations with limit
        const result = await getConversations({
          db,
          userId: user.id,
          ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
          ownerIdentifier: 'network-route',
          limit: 2
        });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(2);
      });
    });
  });

  describe('error cases', () => {
    it('should return an error if userId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getConversations({
          db,
          userId: '',
          ownerType: CONVERSATION_OWNER_TYPES.PERSON,
          ownerIdentifier: ''
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.VALIDATION_ERROR);
      });
    });
  });
});
