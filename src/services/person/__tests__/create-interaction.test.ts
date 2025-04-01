import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { clearEventTriggerMocks, verifyEventTrigger } from '@/tests/utils/event-mock';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createInteraction, ERRORS, getPersonActivity } from '../person-activity';

describe('person-activity service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  beforeEach(() => {
    clearEventTriggerMocks();
  });

  describe('createInteraction', () => {
    describe('success cases', () => {
      it('should create a new interaction and trigger event', async () => {
        await withTestTransaction(supabase, async (db) => {
          // Setup test data
          const testUser = await createTestUser({ db });
          const testPerson = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'John',
              last_name: 'Doe'
            }
          });

          // Create interaction
          const result = await createInteraction({
            db,
            data: {
              person_id: testPerson.id,
              user_id: testUser.id,
              type: 'meeting',
              note: 'Had coffee'
            }
          });

          // Verify creation
          expect(result.error).toBeNull();
          expect(result.data).toBeDefined();
          expect(result.data).toMatchObject({
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'meeting',
            note: 'Had coffee'
          });

          // Verify event was triggered with correct data
          verifyEventTrigger({
            eventName: 'Interaction.Created',
            payload: {
              personId: testPerson.id,
              userId: testUser.id,
              personName: 'test_John test_Doe'
            },
            options: {}
          });

          // Verify it appears in activity list
          const activityResult = await getPersonActivity({
            db,
            personId: testPerson.id
          });

          expect(activityResult.data).toHaveLength(1);
          expect(activityResult.data?.[0]).toMatchObject({
            person_id: testPerson.id,
            type: 'meeting',
            note: 'Had coffee'
          });
        });
      });

      it('should create interaction without note', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testPerson = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'John',
              last_name: 'Doe'
            }
          });

          const result = await createInteraction({
            db,
            data: {
              person_id: testPerson.id,
              user_id: testUser.id,
              type: 'call'
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'call',
            note: null
          });

          // Verify event was triggered with correct data
          verifyEventTrigger({
            eventName: 'Interaction.Created',
            payload: {
              personId: testPerson.id,
              userId: testUser.id,
              personName: 'test_John test_Doe'
            },
            options: {}
          });
        });
      });
    });

    describe('error cases', () => {
      it('should return error for missing user_id', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await createInteraction({
            db,
            data: {
              person_id: 'some-id',
              user_id: '', // Empty user_id
              type: 'meeting'
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.INVALID_USER);
        });
      });

      it('should return error for missing person_id', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await createInteraction({
            db,
            data: {
              person_id: '', // Empty person_id
              user_id: 'some-id',
              type: 'meeting'
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.INVALID_PERSON);
        });
      });

      it('should handle database errors', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await createInteraction({
            db,
            data: {
              person_id: 'invalid-uuid',
              user_id: 'invalid-uuid',
              type: 'meeting'
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.CREATE_FAILED);
        });
      });
    });
  });
});
