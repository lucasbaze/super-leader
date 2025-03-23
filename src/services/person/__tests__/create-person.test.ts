import { SupabaseClient } from '@supabase/supabase-js';

import { dateHandler } from '@/lib/dates/helpers';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createPerson, ERRORS } from '../create-person';

describe('person service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('createPerson', () => {
    describe('success cases', () => {
      it('should create a new person without a note', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await createPerson({
            db,
            data: {
              first_name: 'John',
              last_name: 'Doe',
              user_id: testUser.id
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            first_name: 'John',
            last_name: 'Doe',
            user_id: testUser.id
          });
        });
      });

      it('should create a person with a note and interaction', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await createPerson({
            db,
            data: {
              first_name: 'Jane',
              last_name: 'Smith',
              note: 'Met at conference',
              user_id: testUser.id
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            first_name: 'Jane',
            last_name: 'Smith',
            user_id: testUser.id
          });

          // Verify interaction was created
          const { data: interactions } = await db
            .from('interactions')
            .select('*')
            .eq('person_id', result.data!.id)
            .eq('user_id', testUser.id);

          expect(interactions).toHaveLength(1);
          expect(interactions![0]).toMatchObject({
            note: 'Met at conference',
            type: 'note'
          });
        });
      });

      it('should create a person with a date_met', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const dateMet = dateHandler().format('YYYY-MM-DD');

          const result = await createPerson({
            db,
            data: {
              first_name: 'Alice',
              last_name: 'Johnson',
              date_met: dateMet,
              user_id: testUser.id
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            first_name: 'Alice',
            last_name: 'Johnson',
            date_met: dateMet,
            user_id: testUser.id
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
            data: {
              first_name: '',
              last_name: 'Doe',
              user_id: testUser.id
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.VALIDATION_ERROR);
        });
      });

      it('should return error for missing user_id', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await createPerson({
            db,
            data: {
              first_name: 'John',
              last_name: 'Doe',
              user_id: ''
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
            data: {
              first_name: 'John',
              last_name: 'Doe',
              user_id: 'invalid-uuid'
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.CREATE_FAILED);
        });
      });
    });
  });
});
