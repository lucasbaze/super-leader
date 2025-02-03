import { SupabaseClient } from '@supabase/supabase-js';

import { createTestInteraction } from '@/tests/test-builder/create-interaction';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, getPersonActivity } from '../person-activity';

describe('getPersonActivity service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should return interactions for a person', async () => {
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

        // Create some test interactions
        const interaction1 = await createTestInteraction({
          db,
          data: {
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'meeting',
            note: 'Had coffee'
          }
        });

        const interaction2 = await createTestInteraction({
          db,
          data: {
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'call',
            note: 'Quick chat'
          }
        });

        // Test the service method
        const result = await getPersonActivity({
          db,
          personId: testPerson.id
        });

        // Assertions
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data).toHaveLength(2);

        // Verify the interactions are returned in correct order (newest first)
        expect(result.data?.[0]).toMatchObject({
          id: interaction2.id,
          type: 'call',
          note: 'Quick chat'
        });
        expect(result.data?.[1]).toMatchObject({
          id: interaction1.id,
          type: 'meeting',
          note: 'Had coffee'
        });
      });
    });

    it('should return empty array when person has no interactions', async () => {
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

        const result = await getPersonActivity({
          db,
          personId: testPerson.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toEqual([]);
      });
    });
  });

  describe('error cases', () => {
    it('should handle invalid person id', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getPersonActivity({
          db,
          personId: 'invalid-uuid-format'
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.FETCH_FAILED.name,
          type: ERRORS.FETCH_FAILED.type,
          displayMessage: ERRORS.FETCH_FAILED.displayMessage
        });
      });
    });
  });
});
