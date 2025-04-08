import { SupabaseClient } from '@supabase/supabase-js';

import { CONVERSATION_OWNER_TYPES } from '@/services/conversations/constants';
import { createTestGroup } from '@/tests/test-builder/create-group';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import {
  createGroupMessages,
  createPersonMessage,
  ERRORS,
  getInitialMessages,
  INITIAL_MESSAGES
} from '../get-initial-message';

describe('get-initial-message-service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('getInitialMessages', () => {
    describe('success cases', () => {
      it('should return initial messages for a person conversation', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testPerson = await createTestPerson({
            db,
            data: { user_id: testUser.id, first_name: 'John', last_name: 'Doe' }
          });

          const result = await getInitialMessages({
            db,
            userId: testUser.id,
            ownerType: CONVERSATION_OWNER_TYPES.PERSON,
            ownerIdentifier: testPerson.id
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(1); // Initial messages for person
          const messages = result.data;

          expect(messages?.[0]).toContain('test_John');
        });
      });

      it('should return initial messages for a group conversation', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const group = await createTestGroup({
            db,
            data: { user_id: testUser.id, name: 'Test Group', slug: 'test-group' }
          });

          const result = await getInitialMessages({
            db,
            userId: testUser.id,
            ownerType: CONVERSATION_OWNER_TYPES.GROUP,
            ownerIdentifier: group.id
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(2); // Initial messages for group
          const messages = result.data;

          expect(messages?.[0]).toBe(createGroupMessages('Test Group', 'default-icon')[0]);
          expect(messages?.[1]).toBe(createGroupMessages('Test Group', 'default-icon')[1]);
        });
      });

      it('should return initial messages for a route conversation', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await getInitialMessages({
            db,
            userId: testUser.id,
            ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
            ownerIdentifier: 'onboarding'
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(2);
          expect(result.data?.[0]).toBe(INITIAL_MESSAGES.onboarding[0]);
          expect(result.data?.[1]).toBe(INITIAL_MESSAGES.onboarding[1]);
        });
      });

      it('should return initial messages for an app route conversation', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await getInitialMessages({
            db,
            userId: testUser.id,
            ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
            ownerIdentifier: 'network'
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(2); // Initial messages for network route
        });
      });

      it('should return initial messages for inner5 group', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const group = await createTestGroup({
            db,
            data: { user_id: testUser.id, name: 'Inner 5', slug: 'inner-5' }
          });

          const result = await getInitialMessages({
            db,
            userId: testUser.id,
            ownerType: CONVERSATION_OWNER_TYPES.GROUP,
            ownerIdentifier: group.id
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(2); // Initial messages for inner5
          const messages = result.data;
          expect(messages?.[0]).toBe(INITIAL_MESSAGES.inner5[0]);
          expect(messages?.[1]).toBe(INITIAL_MESSAGES.inner5[1]);
        });
      });

      it('should return initial messages for central50 group', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const group = await createTestGroup({
            db,
            data: { user_id: testUser.id, name: 'Central 50', slug: 'central-50' }
          });

          const result = await getInitialMessages({
            db,
            userId: testUser.id,
            ownerType: CONVERSATION_OWNER_TYPES.GROUP,
            ownerIdentifier: group.id
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(2); // Initial messages for central50
          const messages = result.data;
          expect(messages?.[0]).toBe(INITIAL_MESSAGES.central50[0]);
          expect(messages?.[1]).toBe(INITIAL_MESSAGES.central50[1]);
        });
      });
    });

    describe('error cases', () => {
      it('should return a default message if userId is missing', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await getInitialMessages({
            db,
            userId: '',
            ownerType: CONVERSATION_OWNER_TYPES.ROUTE,
            ownerIdentifier: 'home'
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(1); // Default message for invalid owner type
          const messages = result.data;
          expect(messages?.[0]).toBe(INITIAL_MESSAGES.default[0]);
        });
      });

      it('should return a default message if ownerType is invalid', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await getInitialMessages({
            db,
            userId: testUser.id,
            // @ts-ignore - Testing invalid input
            ownerType: 'invalid-type',
            ownerIdentifier: 'home'
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(1); // Default message for invalid owner type
          const messages = result.data;
          expect(messages?.[0]).toBe(INITIAL_MESSAGES.default[0]);
        });
      });

      it('should return an error if ownerIdentifier is missing for person type', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await getInitialMessages({
            db,
            userId: testUser.id,
            ownerType: CONVERSATION_OWNER_TYPES.PERSON,
            ownerIdentifier: ''
          });
          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(1); // Default message for invalid owner type
          const messages = result.data;
          expect(messages?.[0]).toBe(INITIAL_MESSAGES.default[0]);
        });
      });
    });
  });
});
