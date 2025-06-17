import { SupabaseClient } from '@supabase/supabase-js';
import { omit } from 'lodash';

import { dateHandler } from '@/lib/dates/helpers';
import { PersonCreateFormData } from '@/lib/schemas/person-create';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createPerson, ERRORS } from '../create-person';

describe('person service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  // Helper to build minimal person create data
  const buildPersonData = (overrides: Partial<PersonCreateFormData['person']> = {}): PersonCreateFormData => ({
    person: {
      first_name: 'John',
      last_name: 'Doe',
      ...overrides
    }
  });

  describe('createPerson', () => {
    describe('success cases', () => {
      it('should create a new person', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await createPerson({
            db,
            data: buildPersonData(),
            userId: testUser.id
          });

          expect(result.error).toBeNull();
          expect(result.data?.person).toMatchObject({
            first_name: 'John',
            last_name: 'Doe',
            user_id: testUser.id
          });
        });
      });

      it('should create a person with a date_met', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const dateMet = dateHandler().format('YYYY-MM-DD');

          const result = await createPerson({
            db,
            data: buildPersonData({
              first_name: 'Alice',
              last_name: 'Johnson',
              date_met: dateMet
            }),
            userId: testUser.id
          });

          expect(result.error).toBeNull();
          expect(result.data?.person).toMatchObject({
            first_name: 'Alice',
            last_name: 'Johnson',
            date_met: dateMet,
            user_id: testUser.id
          });
        });
      });

      it('should create a person with addresses, contact methods, and websites', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const address = {
            street: '123 Main St',
            city: 'Metropolis',
            state: 'NY',
            postal_code: '12345',
            country: 'USA',
            label: 'Home',
            is_primary: true,
            _delete: false
          };
          const contactMethod = {
            type: 'email',
            value: 'john@example.com',
            label: 'Work',
            is_primary: true,
            _delete: false
          };
          const website = {
            url: 'https://example.com',
            label: 'Personal',
            _delete: false
          };

          const result = await createPerson({
            db,
            userId: testUser.id,
            data: {
              person: {
                first_name: 'John',
                last_name: 'Doe'
              },
              addresses: [address],
              contactMethods: [contactMethod],
              websites: [website]
            }
          });

          expect(result.error).toBeNull();
          expect(result.data?.person).toMatchObject({
            first_name: 'John',
            last_name: 'Doe',
            user_id: testUser.id
          });
          expect(result.data?.addresses?.[0]).toMatchObject(omit(address, '_delete'));
          expect(result.data?.contactMethods?.[0]).toMatchObject(omit(contactMethod, '_delete'));
          expect(result.data?.websites?.[0]).toMatchObject({
            url: 'https://example.com',
            label: 'Personal'
          });
        });
      });

      it('should create a person with a note and interaction', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const note = 'Met at conference';
          const result = await createPerson({
            db,
            userId: testUser.id,
            data: {
              ...buildPersonData({ first_name: 'Jane', last_name: 'Smith' }),
              note
            }
          });

          expect(result.error).toBeNull();
          expect(result.data?.person).toMatchObject({
            first_name: 'Jane',
            last_name: 'Smith',
            user_id: testUser.id
          });
          expect(result.data?.interaction).toBeTruthy();
          expect(result.data?.interaction).toMatchObject({
            note,
            type: 'note',
            person_id: result.data?.person.id,
            user_id: testUser.id
          });

          // Verify interaction was created in DB
          const { data: interactions } = await db
            .from('interactions')
            .select('*')
            .eq('person_id', result.data!.person.id)
            .eq('user_id', testUser.id);

          expect(interactions).toHaveLength(1);
          expect(interactions![0]).toMatchObject({
            note,
            type: 'note'
          });
        });
      });
    });

    describe('error cases', () => {
      it('should return error for missing first name', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await createPerson({
            db,
            userId: testUser.id,
            data: {
              person: {
                first_name: '',
                last_name: 'Doe'
              }
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_ERROR);
        });
      });

      it('should handle database errors', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await createPerson({
            db,
            userId: 'invalid-uuid',
            data: {
              person: {
                first_name: 'John',
                last_name: 'Doe'
              }
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.CREATE_FAILED);
        });
      });
    });
  });
});
