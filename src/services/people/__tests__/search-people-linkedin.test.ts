import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, searchPerson } from '../search-people-linkedin';

describe('searchPerson service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should find a person by exact name match', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            linkedin_public_id: 'john-doe-123'
          },
          withPrefix: false
        });

        const result = await searchPerson({
          db,
          userId: testUser.id,
          firstName: 'John',
          lastName: 'Doe',
          linkedinPublicId: 'different-linkedin-id'
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testPerson.id,
          first_name: 'John',
          last_name: 'Doe',
          linkedin_public_id: 'john-doe-123'
        });
      });
    });

    it('should find a person by exact LinkedIn ID match', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            linkedin_public_id: 'john-doe-123'
          },
          withPrefix: false
        });

        const result = await searchPerson({
          db,
          userId: testUser.id,
          firstName: 'Different',
          lastName: 'Name',
          linkedinPublicId: 'john-doe-123'
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testPerson.id,
          first_name: 'John',
          last_name: 'Doe',
          linkedin_public_id: 'john-doe-123'
        });
      });
    });

    it('should find a person when both name and LinkedIn ID match', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            linkedin_public_id: 'john-doe-123'
          },
          withPrefix: false
        });

        const result = await searchPerson({
          db,
          userId: testUser.id,
          firstName: 'John',
          lastName: 'Doe',
          linkedinPublicId: 'john-doe-123'
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testPerson.id,
          first_name: 'John',
          last_name: 'Doe',
          linkedin_public_id: 'john-doe-123'
        });
      });
    });

    it('should return null when no matches found', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await searchPerson({
          db,
          userId: testUser.id,
          firstName: 'Nonexistent',
          lastName: 'Person',
          linkedinPublicId: 'nonexistent-id'
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeNull();
      });
    });

    it('should only find person from the correct user', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const otherUser = await createTestUser({ db });

        await createTestPerson({
          db,
          data: {
            user_id: otherUser.id,
            first_name: 'John',
            last_name: 'Doe',
            linkedin_public_id: 'john-doe-123'
          },
          withPrefix: false
        });

        const result = await searchPerson({
          db,
          userId: testUser.id,
          firstName: 'John',
          lastName: 'Doe',
          linkedinPublicId: 'john-doe-123'
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeNull();
      });
    });
  });

  describe('error cases', () => {
    it('should return error when userId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await searchPerson({
          db,
          userId: '',
          firstName: 'John',
          lastName: 'Doe',
          linkedinPublicId: 'john-doe-123'
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.SEARCH.MISSING_USER_ID);
      });
    });

    it('should return error when firstName is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await searchPerson({
          db,
          userId: testUser.id,
          firstName: '',
          lastName: 'Doe',
          linkedinPublicId: 'john-doe-123'
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.SEARCH.MISSING_SEARCH_PARAMS);
      });
    });

    it('should return error when lastName is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await searchPerson({
          db,
          userId: testUser.id,
          firstName: 'John',
          lastName: '',
          linkedinPublicId: 'john-doe-123'
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.SEARCH.MISSING_SEARCH_PARAMS);
      });
    });

    it('should return error when linkedinPublicId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const result = await searchPerson({
          db,
          userId: testUser.id,
          firstName: 'John',
          lastName: 'Doe',
          linkedinPublicId: ''
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.SEARCH.MISSING_SEARCH_PARAMS);
      });
    });
  });
});
