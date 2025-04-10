import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, saveSuggestions } from '../save-suggestions';
import { ContentVariant } from '../types';

describe('suggestions service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('saveSuggestions', () => {
    // Helper function to create test data
    const createTestData = async (db: SupabaseClient) => {
      const testUser = await createTestUser({ db });
      const testPerson = await createTestPerson({
        db,
        data: {
          user_id: testUser.id,
          first_name: 'John',
          last_name: 'Doe'
        }
      });

      return { testUser, testPerson };
    };

    // Helper function to create a suggestion
    const createSuggestion = (
      personId: string,
      userId: string,
      topic: string,
      type: 'content' | 'gift' = 'content'
    ) => ({
      person_id: personId,
      user_id: userId,
      suggestion: {
        suggestedContent: {
          title: `${topic} Suggestion`,
          description: `This is a ${topic.toLowerCase()} suggestion`,
          url: 'https://test.com'
        },
        messageVariants: [
          {
            message: `This is a ${topic.toLowerCase()} suggestion`,
            tone: 'test'
          }
        ]
      },
      topic,
      type
    });

    // Helper function to create an invalid suggestion
    const createInvalidSuggestion = (
      personId: string,
      userId: string,
      topic: string,
      type: 'content' | 'gift' = 'content'
    ) => ({
      person_id: personId,
      user_id: userId,
      suggestion: {
        // Missing suggestedContent and messageVariants
        title: `${topic} Suggestion`,
        content: `This is a ${topic.toLowerCase()} suggestion`
      } as unknown as ContentVariant, // Type assertion to bypass TypeScript check for testing
      topic,
      type
    });

    describe('success cases', () => {
      it('should save content suggestions successfully', async () => {
        await withTestTransaction(supabase, async (db) => {
          const { testUser, testPerson } = await createTestData(db);

          const suggestions = [createSuggestion(testPerson.id, testUser.id, 'Test')];

          const result = await saveSuggestions({
            db,
            suggestions
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(1);
          expect(result.data![0]).toMatchObject({
            person_id: testPerson.id,
            user_id: testUser.id,
            topic: 'Test',
            type: 'content'
          });
          expect(result.data![0].suggestion).toEqual(suggestions[0].suggestion);
          expect(result.data![0].id).toBeDefined();
        });
      });

      it('should save multiple suggestions at once', async () => {
        await withTestTransaction(supabase, async (db) => {
          const { testUser, testPerson } = await createTestData(db);

          const suggestions = [
            createSuggestion(testPerson.id, testUser.id, 'First'),
            createSuggestion(testPerson.id, testUser.id, 'Second')
          ];

          const result = await saveSuggestions({
            db,
            suggestions
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(2);
          expect(result.data![0].topic).toBe('First');
          expect(result.data![1].topic).toBe('Second');
        });
      });

      it('should save gift suggestions successfully', async () => {
        await withTestTransaction(supabase, async (db) => {
          const { testUser, testPerson } = await createTestData(db);

          const suggestions = [createSuggestion(testPerson.id, testUser.id, 'Gift', 'gift')];

          const result = await saveSuggestions({
            db,
            suggestions
          });

          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(1);
          expect(result.data![0]).toMatchObject({
            person_id: testPerson.id,
            user_id: testUser.id,
            topic: 'Gift',
            type: 'gift'
          });
        });
      });
    });

    describe('error cases', () => {
      it('should return error for empty suggestions array', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await saveSuggestions({
            db,
            suggestions: []
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.INVALID_SUGGESTIONS);
        });
      });

      it('should return error for null suggestions', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await saveSuggestions({
            db,
            suggestions: null as any
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.INVALID_SUGGESTIONS);
        });
      });

      it('should return error for invalid suggestion format', async () => {
        await withTestTransaction(supabase, async (db) => {
          const { testUser, testPerson } = await createTestData(db);

          const suggestions = [createInvalidSuggestion(testPerson.id, testUser.id, 'Test')];

          const result = await saveSuggestions({
            db,
            suggestions
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.INVALID_SUGGESTION_FORMAT);
        });
      });

      it('should handle database errors', async () => {
        await withTestTransaction(supabase, async (db) => {
          const suggestions = [createSuggestion('invalid-uuid', 'invalid-uuid', 'Test')];

          const result = await saveSuggestions({
            db,
            suggestions
          });

          expect(result.data).toBeNull();
          expect(result.error).toMatchObject(ERRORS.SUGGESTIONS_SAVE_ERROR);
        });
      });
    });
  });
});
