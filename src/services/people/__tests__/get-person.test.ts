import { SupabaseClient } from '@supabase/supabase-js';

import { createTestInteraction } from '@/tests/test-builder/create-interaction';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, getPerson } from '../get-person';

describe('getPerson service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should return person without related data', async () => {
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

        const result = await getPerson({ db, personId: testPerson.id });

        expect(result.data?.person).toMatchObject({
          id: testPerson.id,
          first_name: 'test_John',
          last_name: 'test_Doe'
        });
        expect(result.data?.contactMethods).toBeUndefined();
        expect(result.data?.addresses).toBeUndefined();
        expect(result.data?.websites).toBeUndefined();
        expect(result.error).toBeNull();
      });
    });

    it('should return person with all related data when requested', async () => {
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

        const result = await getPerson({
          db,
          personId: testPerson.id,
          withContactMethods: true,
          withAddresses: true,
          withWebsites: true
        });

        expect(result.data?.person).toBeDefined();
        expect(result.error).toBeNull();
      });
    });

    it('should return person with interactions when requested', async () => {
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

        // Create test interactions
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

        const result = await getPerson({
          db,
          personId: testPerson.id,
          withInteractions: true
        });

        expect(result.data?.person).toBeDefined();
        expect(result.data?.interactions).toHaveLength(2);
        expect(result.data?.interactions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: interaction1.id,
              type: 'meeting',
              note: 'Had coffee'
            }),
            expect.objectContaining({
              id: interaction2.id,
              type: 'call',
              note: 'Quick chat'
            })
          ])
        );
        expect(result.error).toBeNull();
      });
    });

    it('should return person without interactions when not requested', async () => {
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

        // Create an interaction that shouldn't be returned
        await createTestInteraction({
          db,
          data: {
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'meeting',
            note: 'Had coffee'
          }
        });

        const result = await getPerson({
          db,
          personId: testPerson.id
        });

        expect(result.data?.person).toBeDefined();
        expect(result.data?.interactions).toBeUndefined();
        expect(result.error).toBeNull();
      });
    });
  });

  describe('error cases', () => {
    it('should return not found error for non-existent person', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getPerson({ db, personId: crypto.randomUUID() });

        expect(result.error).toMatchObject({
          name: ERRORS.PERSON.NOT_FOUND.name,
          type: ERRORS.PERSON.NOT_FOUND.type,
          displayMessage: ERRORS.PERSON.NOT_FOUND.displayMessage
        });
        expect(result.data).toBeNull();
      });
    });

    it('should handle database errors gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Force a database error by using an invalid ID format
        const result = await getPerson({ db, personId: 'invalid-uuid-format' });

        expect(result.error).toMatchObject({
          name: ERRORS.PERSON.NOT_FOUND.name,
          type: ERRORS.PERSON.NOT_FOUND.type,
          displayMessage: ERRORS.PERSON.NOT_FOUND.displayMessage
        });
        expect(result.data).toBeNull();
      });
    });

    it('should handle interactions fetch error gracefully', async () => {
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

        // Force a database error by mocking the interactions table to throw
        jest.spyOn(db, 'from').mockImplementationOnce(() => {
          throw new Error('Database error');
        });

        const result = await getPerson({
          db,
          personId: testPerson.id,
          withInteractions: true
        });

        expect(result.error).toMatchObject({
          name: ERRORS.PERSON.FETCH_ERROR.name,
          type: ERRORS.PERSON.FETCH_ERROR.type,
          displayMessage: ERRORS.PERSON.FETCH_ERROR.displayMessage
        });
        expect(result.data).toBeNull();
      });
    });
  });
});
