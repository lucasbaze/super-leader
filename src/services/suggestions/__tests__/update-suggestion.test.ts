import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson, createTestSuggestion, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { AuthUser, Person } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, updateSuggestion } from '../update-suggestion';

describe('updateSuggestion service', () => {
  let supabase: SupabaseClient;
  let testUser: AuthUser;
  let testPerson: Person;

  beforeAll(async () => {
    supabase = await createClient();
    testUser = await createTestUser({ db: supabase });
    testPerson = await createTestPerson({
      db: supabase,
      data: {
        user_id: testUser.id,
        first_name: 'John',
        last_name: 'Doe',
        bio: 'Original bio'
      }
    });
  });

  describe('success cases', () => {
    it('should update viewed status from false to true', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testSuggestion = await createTestSuggestion({
          db,
          data: {
            user_id: testUser.id,
            person_id: testPerson.id,
            viewed: false,
            saved: false,
            bad: false
          }
        });

        const result = await updateSuggestion({
          db,
          suggestionId: testSuggestion.id,
          viewed: true,
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testSuggestion.id,
          viewed: true,
          saved: false,
          bad: false
        });
      });
    });

    it('should toggle saved status', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testSuggestion = await createTestSuggestion({
          db,
          data: {
            user_id: testUser.id,
            person_id: testPerson.id,
            viewed: false,
            saved: false,
            bad: false
          }
        });

        const result = await updateSuggestion({
          db,
          suggestionId: testSuggestion.id,
          saved: true,
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testSuggestion.id,
          viewed: false,
          saved: true,
          bad: false
        });
      });
    });

    it('should toggle bad status', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testSuggestion = await createTestSuggestion({
          db,
          data: {
            user_id: testUser.id,
            person_id: testPerson.id,
            viewed: false,
            saved: false,
            bad: false
          }
        });

        const result = await updateSuggestion({
          db,
          suggestionId: testSuggestion.id,
          bad: true,
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testSuggestion.id,
          viewed: false,
          saved: false,
          bad: true
        });
      });
    });

    it('should update multiple fields at once', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testSuggestion = await createTestSuggestion({
          db,
          data: {
            user_id: testUser.id,
            person_id: testPerson.id,
            viewed: false,
            saved: false,
            bad: false
          }
        });

        const result = await updateSuggestion({
          db,
          suggestionId: testSuggestion.id,
          viewed: true,
          saved: true,
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testSuggestion.id,
          viewed: true,
          saved: true,
          bad: false
        });
      });
    });
  });

  describe('validation cases', () => {
    it('should return error when no changes provided', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testSuggestion = await createTestSuggestion({
          db,
          data: {
            user_id: testUser.id,
            person_id: testPerson.id
          }
        });

        const result = await updateSuggestion({
          db,
          suggestionId: testSuggestion.id,
          userId: testUser.id
        });

        expect(result.error).toEqual(ERRORS.UPDATE_SUGGESTION.NO_CHANGES);
        expect(result.data).toBeNull();
      });
    });

    it('should return error when suggestion ID is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await updateSuggestion({
          db,
          // @ts-expect-error
          suggestionId: null,
          viewed: true,
          userId: testUser.id
        });

        expect(result.error).toEqual(ERRORS.UPDATE_SUGGESTION.MISSING_ID);
        expect(result.data).toBeNull();
      });
    });
  });
});
