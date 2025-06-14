import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createPersonPersonJoin, ERRORS } from '../create-person-person-join';

describe('person-person join service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('createPersonPersonJoin', () => {
    describe('success cases', () => {
      it('should create a new person-person relationship', async () => {
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
          const personB = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'Bob',
              last_name: 'Jones'
            }
          });

          const note = 'Met at the conference';
          const relation = 'colleague';

          const result = await createPersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: personA.id,
              nodePersonId: personB.id,
              note,
              relation
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            edgePersonId: personA.id,
            nodePersonId: personB.id,
            note,
            relation
          });

          // Verify in DB
          const { data: join, error: fetchError } = await db
            .from('person_person_relation')
            .select('user_id, edge_person_id, node_person_id, note, relation')
            .eq('edge_person_id', personA.id)
            .eq('node_person_id', personB.id)
            .single();

          expect(fetchError).toBeNull();
          expect(join).toMatchObject({
            user_id: testUser.id,
            edge_person_id: personA.id,
            node_person_id: personB.id,
            note,
            relation
          });
        });
      });
    });

    describe('error cases', () => {
      it('should return error for missing edge_person_id', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const personB = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'Bob',
              last_name: 'Jones'
            }
          });

          const result = await createPersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: '',
              nodePersonId: personB.id,
              note: 'note',
              relation: 'friend'
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_ERROR);
        });
      });

      it('should return error for missing node_person_id', async () => {
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

          const result = await createPersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: personA.id,
              nodePersonId: '',
              note: 'note',
              relation: 'friend'
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_ERROR);
        });
      });

      it('should return error if either person does not exist', async () => {
        await withTestTransaction(supabase, async (db) => {
          const fakeId = '00000000-0000-0000-0000-000000000000';
          const testUser = await createTestUser({ db });
          const personA = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'Alice',
              last_name: 'Smith'
            }
          });

          // node_person_id does not exist
          let result = await createPersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: personA.id,
              nodePersonId: fakeId,
              note: 'note',
              relation: 'friend'
            }
          });
          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.PERSON_NOT_FOUND);

          // edge_person_id does not exist
          result = await createPersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: fakeId,
              nodePersonId: personA.id,
              note: 'note',
              relation: 'friend'
            }
          });
          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.PERSON_NOT_FOUND);
        });
      });
    });
  });
});
