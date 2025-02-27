import { SupabaseClient } from '@supabase/supabase-js';

import { createTestGroup, createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { CONVERSATION_OWNER_TYPES } from '../constants';
import { createConversation, ERRORS } from '../create-conversation';

describe('createConversation', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should create a conversation for a person', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user = await createTestUser({ db });

        const testPerson1 = await createTestPerson({
          db,
          data: {
            user_id: user.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        const result = await createConversation({
          db,
          userId: user.id,
          name: 'Test Conversation',
          ownerType: CONVERSATION_OWNER_TYPES.PERSON,
          ownerIdentifier: testPerson1.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          user_id: user.id,
          name: 'Test Conversation'
        });
      });
    });

    it('should create a conversation for a group', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user = await createTestUser({ db });

        const testGroup = await createTestGroup({
          db,
          data: {
            user_id: user.id,
            name: 'Test Group',
            slug: 'test-group'
          }
        });

        const result = await createConversation({
          db,
          userId: user.id,
          name: 'Test Conversation',
          ownerType: CONVERSATION_OWNER_TYPES.GROUP,
          ownerIdentifier: testGroup.id
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
          name: 'Test Conversation',
          ownerType: CONVERSATION_OWNER_TYPES.PERSON,
          ownerIdentifier: ''
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.VALIDATION_ERROR);
      });
    });

    it('should return an error if name is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user = await createTestUser({ db });

        const result = await createConversation({
          db,
          userId: user.id,
          name: '',
          ownerType: CONVERSATION_OWNER_TYPES.PERSON,
          ownerIdentifier: ''
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.VALIDATION_ERROR);
      });
    });
  });
});
