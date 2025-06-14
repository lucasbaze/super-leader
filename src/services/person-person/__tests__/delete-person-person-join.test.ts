import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createPersonPersonJoin } from '../create-person-person-join';
import { deletePersonPersonJoin, ERRORS } from '../delete-person-person-join';

describe('person-person join service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('deletePersonPersonJoin', () => {
    describe('success cases', () => {
      it('should delete an existing person-person relationship when edge->node', async () => {
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

          // First create the relationship
          const createResult = await createPersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: personA.id,
              nodePersonId: personB.id,
              note: 'Met at conference',
              relation: 'colleague'
            }
          });

          expect(createResult.error).toBeNull();

          // Then delete it using the same edge->node direction
          const deleteResult = await deletePersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: personA.id,
              nodePersonId: personB.id
            }
          });

          expect(deleteResult.error).toBeNull();
          expect(deleteResult.data).toMatchObject({
            edge_person_id: personA.id,
            node_person_id: personB.id,
            user_id: testUser.id,
            note: 'Met at conference',
            relation: 'colleague'
          });

          // Verify the relationship was actually deleted
          const { data: relationship, error: fetchError } = await db
            .from('person_person_relation')
            .select('*')
            .eq('edge_person_id', personA.id)
            .eq('node_person_id', personB.id)
            .single();

          expect(fetchError).toBeTruthy(); // Should error because no record found
          expect(relationship).toBeNull();
        });
      });

      it('should delete an existing person-person relationship when node->edge', async () => {
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

          // First create the relationship
          const createResult = await createPersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: personA.id,
              nodePersonId: personB.id,
              note: 'Met at conference',
              relation: 'colleague'
            }
          });

          expect(createResult.error).toBeNull();

          // Then delete it using the reverse node->edge direction
          const deleteResult = await deletePersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: personB.id,
              nodePersonId: personA.id
            }
          });

          expect(deleteResult.error).toBeNull();
          expect(deleteResult.data).toMatchObject({
            edge_person_id: personA.id,
            node_person_id: personB.id,
            user_id: testUser.id,
            note: 'Met at conference',
            relation: 'colleague'
          });

          // Verify the relationship was actually deleted
          const { data: relationship, error: fetchError } = await db
            .from('person_person_relation')
            .select('*')
            .eq('edge_person_id', personA.id)
            .eq('node_person_id', personB.id)
            .single();

          expect(fetchError).toBeTruthy(); // Should error because no record found
          expect(relationship).toBeNull();
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

          const result = await deletePersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: '',
              nodePersonId: personB.id
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

          const result = await deletePersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: personA.id,
              nodePersonId: ''
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_ERROR);
        });
      });

      it('should return error for missing user_id', async () => {
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

          const result = await deletePersonPersonJoin({
            db,
            data: {
              userId: '',
              edgePersonId: personA.id,
              nodePersonId: personB.id
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_ERROR);
        });
      });

      it('should return not found error for non-existent relationship', async () => {
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

          const result = await deletePersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: personA.id,
              nodePersonId: personB.id
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.NOT_FOUND);
        });
      });

      it('should handle database errors for invalid edge_person_id', async () => {
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

          const result = await deletePersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: 'invalid-uuid',
              nodePersonId: personB.id
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.DELETE_FAILED);
        });
      });

      it('should handle database errors for invalid node_person_id', async () => {
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

          const result = await deletePersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: personA.id,
              nodePersonId: 'invalid-uuid'
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.DELETE_FAILED);
        });
      });
    });
  });
});
