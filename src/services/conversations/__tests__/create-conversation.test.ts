import { SupabaseClient } from '@supabase/supabase-js';

import { createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createConversation, ERRORS } from '../create-conversation';

describe('createConversation', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should create a conversation', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user = await createTestUser({ db });

        const result = await createConversation({
          db,
          userId: user.id,
          name: 'Test Conversation'
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          user_id: user.id,
          name: 'Test Conversation'
        });
      });
    });
  });

  describe('error cases', () => {
    it('should return an error if userId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await createConversation({
          db,
          userId: '',
          name: 'Test Conversation'
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.MISSING_USER_ID);
      });
    });

    it('should return an error if name is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user = await createTestUser({ db });

        const result = await createConversation({
          db,
          userId: user.id,
          name: ''
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.MISSING_NAME);
      });
    });
  });
});
