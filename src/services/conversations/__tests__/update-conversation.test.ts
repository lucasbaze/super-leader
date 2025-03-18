import { SupabaseClient } from '@supabase/supabase-js';

import { createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { CONVERSATION_OWNER_TYPES } from '../constants';
import { createConversation } from '../create-conversation';
import { ERRORS, updateConversation } from '../update-conversation';

describe('updateConversation', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should update conversation name', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create a test conversation
        const { data: conversation } = await createConversation({
          db,
          userId: testUser.id,
          name: 'Test Conversation',
          ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
          ownerIdentifier: 'test-route'
        });

        const result = await updateConversation({
          db,
          conversationId: conversation!.id,
          name: 'Updated Conversation',
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: conversation!.id,
          name: 'Updated Conversation'
        });
      });
    });

    it('should return no changes error if name is the same', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create a test conversation
        const { data: conversation } = await createConversation({
          db,
          userId: testUser.id,
          name: 'Test Conversation',
          ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
          ownerIdentifier: 'test-route'
        });

        const result = await updateConversation({
          db,
          conversationId: conversation!.id,
          name: 'Test Conversation', // Same name
          userId: testUser.id
        });

        expect(result.error).toEqual(ERRORS.NO_CHANGES);
        expect(result.data).toBeNull();
      });
    });
  });

  describe('error cases', () => {
    it('should return error if conversationId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await updateConversation({
          db,
          conversationId: '',
          name: 'Updated Conversation',
          userId: 'user-id'
        });

        expect(result.error).toEqual(ERRORS.MISSING_ID);
        expect(result.data).toBeNull();
      });
    });

    it('should return error if name is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const { data: conversation } = await createConversation({
          db,
          userId: testUser.id,
          name: 'Test Conversation',
          ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
          ownerIdentifier: 'test-route'
        });

        const result = await updateConversation({
          db,
          conversationId: conversation!.id,
          userId: testUser.id
        });

        expect(result.error).toEqual(ERRORS.NO_CHANGES);
        expect(result.data).toBeNull();
      });
    });
  });
});
