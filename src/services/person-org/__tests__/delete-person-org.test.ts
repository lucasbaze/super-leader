import { SupabaseClient } from '@supabase/supabase-js';

import { createTestOrganization } from '@/tests/test-builder/create-organization';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createPersonOrg } from '../create-person-org';
import { deletePersonOrg, ERRORS } from '../delete-person-org';

describe('person-org service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('deletePersonOrg', () => {
    describe('success cases', () => {
      it('should delete an existing person-organization relationship', async () => {
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
          const testOrg = await createTestOrganization({
            db,
            data: {
              user_id: testUser.id,
              name: 'Test Org',
              url: 'https://test.com'
            }
          });

          // First create the relationship
          const createResult = await createPersonOrg({
            db,
            data: {
              person_id: testPerson.id,
              organization_id: testOrg.id,
              user_id: testUser.id
            }
          });

          expect(createResult.error).toBeNull();

          // Then delete it
          const deleteResult = await deletePersonOrg({
            db,
            data: {
              person_id: testPerson.id,
              organization_id: testOrg.id,
              user_id: testUser.id
            }
          });

          expect(deleteResult.error).toBeNull();
          expect(deleteResult.data).toMatchObject({
            person_id: testPerson.id,
            organization_id: testOrg.id,
            user_id: testUser.id
          });

          // Verify the relationship was actually deleted
          const { data: relationships, error: fetchError } = await db
            .from('person_organization')
            .select('*')
            .eq('person_id', testPerson.id)
            .eq('organization_id', testOrg.id)
            .single();

          expect(fetchError).toBeTruthy(); // Should error because no record found
          expect(relationships).toBeNull();
        });
      });
    });

    describe('error cases', () => {
      it('should return error for missing person_id', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testOrg = await createTestOrganization({
            db,
            data: {
              user_id: testUser.id,
              name: 'Test Org',
              url: 'https://test.com'
            }
          });

          const result = await deletePersonOrg({
            db,
            data: {
              person_id: '',
              organization_id: testOrg.id,
              user_id: testUser.id
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_ERROR);
        });
      });

      it('should return error for missing organization_id', async () => {
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

          const result = await deletePersonOrg({
            db,
            data: {
              person_id: testPerson.id,
              organization_id: '',
              user_id: testUser.id
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_ERROR);
        });
      });

      it('should return error for missing user_id', async () => {
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
          const testOrg = await createTestOrganization({
            db,
            data: {
              user_id: testUser.id,
              name: 'Test Org',
              url: 'https://test.com'
            }
          });

          const result = await deletePersonOrg({
            db,
            data: {
              person_id: testPerson.id,
              organization_id: testOrg.id,
              user_id: ''
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_ERROR);
        });
      });

      it('should return not found error for non-existent relationship', async () => {
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
          const testOrg = await createTestOrganization({
            db,
            data: {
              user_id: testUser.id,
              name: 'Test Org',
              url: 'https://test.com'
            }
          });

          const result = await deletePersonOrg({
            db,
            data: {
              person_id: testPerson.id,
              organization_id: testOrg.id,
              user_id: testUser.id
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.NOT_FOUND);
        });
      });

      it('should handle database errors for invalid person_id', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testOrg = await createTestOrganization({
            db,
            data: {
              user_id: testUser.id,
              name: 'Test Org',
              url: 'https://test.com'
            }
          });

          const result = await deletePersonOrg({
            db,
            data: {
              person_id: 'invalid-uuid',
              organization_id: testOrg.id,
              user_id: testUser.id
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.DELETE_FAILED);
        });
      });

      it('should handle database errors for invalid organization_id', async () => {
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

          const result = await deletePersonOrg({
            db,
            data: {
              person_id: testPerson.id,
              organization_id: 'invalid-uuid',
              user_id: testUser.id
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.DELETE_FAILED);
        });
      });
    });
  });
});
