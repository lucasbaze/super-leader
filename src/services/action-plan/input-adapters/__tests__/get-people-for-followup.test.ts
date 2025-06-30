import { SupabaseClient } from '@supabase/supabase-js';

import { dateHandler } from '@/lib/dates/helpers';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { createTestGroup, createTestInteraction, createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, getPeopleForFollowup } from '../general-follow-up/get-people-for-followup';

describe('get-people-for-followup-service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('getPeopleForFollowup', () => {
    describe('success cases', () => {
      it('should return people in central-50 who have not had interactions in past 14 days', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          // Create central-50 group
          const central50Group = await createTestGroup({
            db,
            data: {
              user_id: testUser.id,
              name: 'Central 50',
              slug: RESERVED_GROUP_SLUGS.CENTRAL_50
            }
          });

          // Create test people
          const person1 = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'John',
              last_name: 'Doe'
            }
          });

          const person2 = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'Jane',
              last_name: 'Smith'
            }
          });

          const person3 = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'Bob',
              last_name: 'Johnson'
            }
          });

          // Add people to central-50 group
          await db.from('group_member').insert([
            { user_id: testUser.id, group_id: central50Group.id, person_id: person1.id },
            { user_id: testUser.id, group_id: central50Group.id, person_id: person2.id },
            { user_id: testUser.id, group_id: central50Group.id, person_id: person3.id }
          ]);

          // Create recent interaction for person1 (within 14 days)
          await createTestInteraction({
            db,
            data: {
              user_id: testUser.id,
              person_id: person1.id,
              type: 'email',
              note: 'Recent interaction',
              created_at: dateHandler().subtract(7, 'day').toDate()
            }
          });

          // Create old interaction for person2 (more than 14 days ago)
          await createTestInteraction({
            db,
            data: {
              user_id: testUser.id,
              person_id: person2.id,
              type: 'email',
              note: 'Old interaction',
              created_at: dateHandler().subtract(20, 'day').toDate()
            }
          });

          // person3 has no interactions

          const result = await getPeopleForFollowup({
            db,
            userId: testUser.id
          });

          expect(result.error).toBeNull();
          expect(result.data).toBeDefined();
          expect(result.data?.personIds).toHaveLength(2);
          expect(result.data?.personIds).toContain(person2.id);
          expect(result.data?.personIds).toContain(person3.id);
          expect(result.data?.personIds).not.toContain(person1.id);
        });
      });

      it('should return empty array when no people in central-50 group', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          // Create central-50 group but no members
          await createTestGroup({
            db,
            data: {
              user_id: testUser.id,
              name: 'Central 50',
              slug: RESERVED_GROUP_SLUGS.CENTRAL_50
            }
          });

          const result = await getPeopleForFollowup({
            db,
            userId: testUser.id
          });

          expect(result.error).toBeNull();
          expect(result.data).toBeDefined();
          expect(result.data?.personIds).toHaveLength(0);
        });
      });
    });

    describe('error cases', () => {
      it('should return error when userId is missing', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await getPeopleForFollowup({
            db,
            userId: ''
          });

          expect(result.data).toBeNull();
          expect(result.error).toBeDefined();
          expect(result.error).toEqual(ERRORS.FOLLOWUP.MISSING_USER_ID);
        });
      });
    });
  });
});
