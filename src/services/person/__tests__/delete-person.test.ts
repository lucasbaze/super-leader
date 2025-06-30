import { SupabaseClient } from '@supabase/supabase-js';

import { createPersonOrg } from '@/services/person-org/create-person-org';
import { createPersonPersonJoin } from '@/services/person-person/create-person-person-join';
import { createInteraction } from '@/services/person/person-activity';
import { createTestOrganization } from '@/tests/test-builder/create-organization';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { deletePerson, ERRORS } from '../delete-person';
import { updatePersonAddress, updatePersonContactMethod, updatePersonWebsite } from '../update-person-details';

describe('person service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('deletePerson', () => {
    describe('success cases', () => {
      it('should delete a person and all related records', async () => {
        await withTestTransaction(supabase, async (db) => {
          // Create test user and person
          const testUser = await createTestUser({ db });
          const testPerson = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'John',
              last_name: 'Doe'
            }
          });

          // Create another person for relationship
          const otherPerson = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'Jane',
              last_name: 'Smith'
            }
          });

          // Create test organization
          const testOrg = await createTestOrganization({
            db,
            data: {
              user_id: testUser.id,
              name: 'Test Org',
              url: 'https://test.com'
            }
          });

          // Create person-organization relationship
          await createPersonOrg({
            db,
            data: {
              person_id: testPerson.id,
              organization_id: testOrg.id,
              user_id: testUser.id
            }
          });

          // Create person-person relationship
          await createPersonPersonJoin({
            db,
            data: {
              userId: testUser.id,
              edgePersonId: testPerson.id,
              nodePersonId: otherPerson.id,
              note: 'Met at conference',
              relation: 'colleague'
            }
          });

          // Add contact method
          await updatePersonContactMethod({
            db,
            personId: testPerson.id,
            data: {
              type: 'email',
              value: 'john@example.com',
              is_primary: true
            }
          });

          // Add address
          await updatePersonAddress({
            db,
            personId: testPerson.id,
            data: {
              street: '123 Main St',
              city: 'Boston',
              state: 'MA',
              country: 'USA',
              is_primary: true
            }
          });

          // Add website
          await updatePersonWebsite({
            db,
            personId: testPerson.id,
            data: {
              url: 'https://john.com',
              label: 'Personal'
            }
          });

          // Add interaction
          await createInteraction({
            db,
            data: {
              person_id: testPerson.id,
              user_id: testUser.id,
              type: 'note',
              note: 'Test interaction'
            }
          });

          // Delete the person
          const result = await deletePerson({
            db,
            data: {
              person_id: testPerson.id,
              user_id: testUser.id
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            id: testPerson.id,
            first_name: 'John',
            last_name: 'Doe',
            user_id: testUser.id
          });

          // Verify all related records were deleted
          const [
            personOrgResult,
            personPersonResult,
            contactMethodsResult,
            addressesResult,
            websitesResult,
            interactionsResult
          ] = await Promise.all([
            db.from('person_organization').select('*').eq('person_id', testPerson.id),
            db
              .from('person_person_relation')
              .select('*')
              .or(`edge_person_id.eq.${testPerson.id},node_person_id.eq.${testPerson.id}`),
            db.from('contact_methods').select('*').eq('person_id', testPerson.id),
            db.from('addresses').select('*').eq('person_id', testPerson.id),
            db.from('websites').select('*').eq('person_id', testPerson.id),
            db.from('interactions').select('*').eq('person_id', testPerson.id)
          ]);

          expect(personOrgResult.data).toHaveLength(0);
          expect(personPersonResult.data).toHaveLength(0);
          expect(contactMethodsResult.data).toHaveLength(0);
          expect(addressesResult.data).toHaveLength(0);
          expect(websitesResult.data).toHaveLength(0);
          expect(interactionsResult.data).toHaveLength(0);
        });
      });
    });

    describe('error cases', () => {
      it('should return error for missing person_id', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await deletePerson({
            db,
            data: {
              person_id: '',
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

          const result = await deletePerson({
            db,
            data: {
              person_id: testPerson.id,
              user_id: ''
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_ERROR);
        });
      });

      it('should return not found error for non-existent person', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await deletePerson({
            db,
            data: {
              person_id: '00000000-0000-0000-0000-000000000000',
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

          const result = await deletePerson({
            db,
            data: {
              person_id: 'invalid-uuid',
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
