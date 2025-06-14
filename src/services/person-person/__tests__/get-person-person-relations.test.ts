import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createPersonPersonJoin } from '../create-person-person-join';
import { ERRORS, getPersonPersonRelations } from '../get-person-person-relations';

describe('getPersonPersonRelations service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  it('should return all person-person relations for a person (edge and node)', async () => {
    await withTestTransaction(supabase, async (db) => {
      const testUser = await createTestUser({ db });
      const personA = await createTestPerson({
        db,
        data: {
          user_id: testUser.id,
          first_name: 'Alice',
          last_name: 'Smith'
        },
        withPrefix: false
      });
      const personB = await createTestPerson({
        db,
        data: {
          user_id: testUser.id,
          first_name: 'Bob',
          last_name: 'Jones'
        },
        withPrefix: false
      });
      const personC = await createTestPerson({
        db,
        data: {
          user_id: testUser.id,
          first_name: 'Carol',
          last_name: 'Lee'
        },
        withPrefix: false
      });

      // Create two relations: A->B and C->A
      await createPersonPersonJoin({
        db,
        data: {
          userId: testUser.id,
          edgePersonId: personA.id,
          nodePersonId: personB.id,
          note: 'A knows B',
          relation: 'friend'
        }
      });

      await createPersonPersonJoin({
        db,
        data: {
          userId: testUser.id,
          edgePersonId: personC.id,
          nodePersonId: personA.id,
          note: 'C knows A',
          relation: 'colleague'
        }
      });

      // Query for personA
      const result = await getPersonPersonRelations({ db, personId: personA.id });
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(2);
      // Should include B and C as the 'other' person
      const names = result.data!.map((r) => r.name).sort();
      expect(names).toEqual(['Bob Jones', 'Carol Lee']);
      // Should include correct fields
      for (const rel of result.data!) {
        expect(rel).toHaveProperty('id');
        expect(rel).toHaveProperty('relation');
        expect(rel).toHaveProperty('note');
        expect(rel).toHaveProperty('first_name');
        expect(rel).toHaveProperty('last_name');
        expect(rel).toHaveProperty('name');
      }
    });
  });

  it('should return an error for missing personId', async () => {
    await withTestTransaction(supabase, async (db) => {
      const result = await getPersonPersonRelations({ db, personId: '' });
      expect(result.data).toBeNull();
      expect(result.error).toMatchObject(ERRORS.PERSON_PERSON_RELATIONS.MISSING_PERSON_ID);
    });
  });

  it('should return an empty array if no relations exist', async () => {
    await withTestTransaction(supabase, async (db) => {
      const testUser = await createTestUser({ db });
      const personA = await createTestPerson({
        db,
        data: {
          user_id: testUser.id,
          first_name: 'Alice',
          last_name: 'Smith'
        }
      });
      const result = await getPersonPersonRelations({ db, personId: personA.id });
      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });
  });
});
