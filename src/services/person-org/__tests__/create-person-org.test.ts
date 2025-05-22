import { SupabaseClient } from '@supabase/supabase-js';

import { createTestOrganization } from '@/tests/test-builder/create-organization';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createPersonOrg, ERRORS } from '../create-person-org';

describe('person-org service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('createPersonOrg', () => {
    describe('success cases', () => {
      it('should create a new person-organization relationship', async () => {
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
              url: 'https://test.com',
              name: 'Test Org'
            }
          });

          const result = await createPersonOrg({
            db,
            data: {
              person_id: testPerson.id,
              organization_id: testOrg.id,
              user_id: testUser.id
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            person_id: testPerson.id,
            organization_id: testOrg.id,
            user_id: testUser.id
          });

          // Verify the relationship was actually created in the database
          const { data: relationships, error: fetchError } = await db
            .from('person_organization')
            .select('*')
            .eq('person_id', testPerson.id)
            .eq('organization_id', testOrg.id)
            .single();

          expect(fetchError).toBeNull();
          expect(relationships).toMatchObject({
            person_id: testPerson.id,
            organization_id: testOrg.id,
            user_id: testUser.id
          });
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
              url: 'https://test.com',
              name: 'Test Org'
            }
          });

          const result = await createPersonOrg({
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

          const result = await createPersonOrg({
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
              url: 'https://test.com',
              name: 'Test Org'
            }
          });

          const result = await createPersonOrg({
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

      it('should handle database errors for invalid person_id', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testOrg = await createTestOrganization({
            db,
            data: {
              user_id: testUser.id,
              url: 'https://test.com',
              name: 'Test Org'
            }
          });

          const result = await createPersonOrg({
            db,
            data: {
              person_id: 'invalid-uuid',
              organization_id: testOrg.id,
              user_id: testUser.id
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.CREATE_FAILED);
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

          const result = await createPersonOrg({
            db,
            data: {
              person_id: testPerson.id,
              organization_id: 'invalid-uuid',
              user_id: testUser.id
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.CREATE_FAILED);
        });
      });
    });
  });
});
