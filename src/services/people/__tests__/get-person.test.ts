import { SupabaseClient } from '@supabase/supabase-js';

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
  });
});
