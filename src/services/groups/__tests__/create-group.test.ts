import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createGroup, ERRORS } from '../create-group';
import { getGroupMembers } from '../get-group-members';

describe('group-service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('createGroup', () => {
    describe('success cases', () => {
      it('should create a new group without members', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await createGroup({
            db,
            data: {
              name: 'Test Group',
              user_id: testUser.id,
              icon: '🚀'
            }
          });

          expect(result.error).toBeNull();
          expect(result.data).toMatchObject({
            name: 'Test Group',
            slug: 'test-group',
            icon: '🚀'
          });
        });
      });

      it('should create a group with members', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });
          const testPerson1 = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'John',
              last_name: 'Doe'
            }
          });
          const testPerson2 = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'Jane',
              last_name: 'Smith'
            }
          });

          const result = await createGroup({
            db,
            data: {
              name: 'Test Group with Members',
              icon: '🚀',
              user_id: testUser.id,
              person_ids: [testPerson1.id, testPerson2.id]
            }
          });

          expect(result.error).toBeNull();

          // Verify group members were created
          const { data: members } = await getGroupMembers({
            db,
            id: result.data!.id,
            userId: testUser.id
          });

          expect(members).toHaveLength(2);
          expect(members?.map((m) => m.id)).toContain(testPerson1.id);
          expect(members?.map((m) => m.id)).toContain(testPerson2.id);
        });
      });

      it('should handle duplicate names by creating unique slugs', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result1 = await createGroup({
            db,
            data: {
              name: 'Test Group',
              icon: '🚀',
              user_id: testUser.id
            }
          });

          const result2 = await createGroup({
            db,
            data: {
              name: 'Test Group',
              icon: '🚀',
              user_id: testUser.id
            }
          });

          expect(result1.data?.slug).toBe('test-group');
          expect(result2.data?.slug).toBe('test-group-2');
        });
      });
    });

    describe('error cases', () => {
      it('should return error for missing name', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await createGroup({
            db,
            data: {
              name: '',
              icon: '🚀',
              user_id: 'some-id'
            }
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.INVALID_NAME);
        });
      });
    });
  });
});
