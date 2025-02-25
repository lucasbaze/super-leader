import { SupabaseClient } from '@supabase/supabase-js';

import { createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createConversation } from '../create-conversation';
import { ERRORS, getConversations } from '../get-conversations';

describe('getConversations', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should get conversations', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create a test user
        const user = await createTestUser({ db });

        // Create some conversations
        await createConversation({
          db,
          userId: user.id,
          name: 'Conversation 1'
        });

        await createConversation({
          db,
          userId: user.id,
          name: 'Conversation 2'
        });

        // Get conversations
        const result = await getConversations({
          db,
          userId: user.id
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
          name: 'Conversation 1'
        });

        await createConversation({
          db,
          userId: user.id,
          name: 'Conversation 2'
        });

        await createConversation({
          db,
          userId: user.id,
          name: 'Conversation 3'
        });

        // Get conversations with limit
        const result = await getConversations({
          db,
          userId: user.id,
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
          userId: ''
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.MISSING_USER_ID);
      });
    });
  });
});
