import { SupabaseClient } from '@supabase/supabase-js';

import { createTestOrganization, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, findOrganizations } from '../find-organizations';

describe('findOrganization', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should return empty array when no organizations exist', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user = await createTestUser({ db });
        const result = await findOrganizations({ db, userId: user.id });

        expect(result.error).toBeNull();
        expect(result.data).toEqual([]);
      });
    });

    it('should return all organizations when no search term is provided', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user = await createTestUser({ db });
        const org1 = await createTestOrganization({
          db,
          data: { user_id: user.id, name: 'Test Org 1', url: 'https://testorg1.com' }
        });
        const org2 = await createTestOrganization({
          db,
          data: { user_id: user.id, name: 'Test Org 2', url: 'https://testorg2.com' }
        });

        const result = await findOrganizations({ db, userId: user.id });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(2);
        expect(result.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: org1.id,
              name: 'Test Org 1'
            }),
            expect.objectContaining({
              id: org2.id,
              name: 'Test Org 2'
            })
          ])
        );
      });
    });

    it('should filter organizations by search term', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user = await createTestUser({ db });
        const org1 = await createTestOrganization({
          db,
          data: { user_id: user.id, name: 'Apple Inc', url: 'https://apple.com' }
        });
        await createTestOrganization({
          db,
          data: { user_id: user.id, name: 'Microsoft Corp', url: 'https://microsoft.com' }
        });

        const result = await findOrganizations({ db, userId: user.id, searchTerm: 'Apple' });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          id: org1.id,
          name: 'Apple Inc'
        });
      });
    });

    it('should search in both name and url fields', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user = await createTestUser({ db });
        const org1 = await createTestOrganization({
          db,
          data: {
            user_id: user.id,
            name: 'Test Org',
            url: 'https://apple.com'
          }
        });
        await createTestOrganization({
          db,
          data: {
            user_id: user.id,
            name: 'Other Org',
            url: 'https://microsoft.com'
          }
        });

        const result = await findOrganizations({ db, userId: user.id, searchTerm: 'apple' });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          id: org1.id,
          name: 'Test Org',
          url: 'https://apple.com'
        });
      });
    });

    it('should only return organizations for the specified user', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user1 = await createTestUser({ db });
        const user2 = await createTestUser({ db });

        const org1 = await createTestOrganization({
          db,
          data: { user_id: user1.id, name: 'User 1 Org', url: 'https://user1org.com' }
        });
        await createTestOrganization({
          db,
          data: { user_id: user2.id, name: 'User 2 Org', url: 'https://user2org.com' }
        });

        const result = await findOrganizations({ db, userId: user1.id });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          id: org1.id,
          name: 'User 1 Org'
        });
      });
    });
  });

  describe('validation cases', () => {
    it('should return error when user_id is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await findOrganizations({ db, userId: '' });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.FIND_ORGANIZATION.MISSING_USER_ID);
      });
    });
  });

  describe('error cases', () => {
    it('should handle database errors gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user = await createTestUser({ db });

        jest.spyOn(db, 'from').mockImplementationOnce(() => {
          throw new Error('Database connection error');
        });

        const result = await findOrganizations({ db, userId: user.id });

        expect(result.error).toMatchObject({
          name: ERRORS.FIND_ORGANIZATION.FETCH_ERROR.name,
          type: ERRORS.FIND_ORGANIZATION.FETCH_ERROR.type
        });
        expect(result.data).toBeNull();
      });
    });
  });
});
