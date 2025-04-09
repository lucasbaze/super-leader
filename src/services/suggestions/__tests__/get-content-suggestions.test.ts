import { SupabaseClient } from '@supabase/supabase-js';

import { formatPersonSummary } from '@/services/person/format-person-summary';
import { getPerson } from '@/services/person/get-person';
import { createTestPerson, createTestSuggestion, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { Person } from '@/types/custom';
import { AuthUser } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

import { generateContentSuggestions } from '../generate-content-variants';
import { generateContentTopics } from '../generate-topic-for-content-suggestions';
import { ERRORS, getContentSuggestionsForPerson } from '../get-content-suggestions';
import { ContentVariant } from '../types';

// Only mock the AI service dependencies
jest.mock('../generate-topic-for-content-suggestions', () => ({
  generateContentTopics: jest.fn()
}));

jest.mock('../generate-content-variants', () => ({
  generateContentSuggestions: jest.fn()
}));

describe('getContentSuggestionsForPerson', () => {
  let supabase: SupabaseClient;
  let testUser: AuthUser;
  let testPerson: Person;

  // Mock data for AI services
  const mockGeneratedTopic = {
    data: {
      topic: 'Test Topic',
      prompt: 'Find content about Test Topic'
    },
    error: null
  };
  const mockContentSuggestions = {
    data: {
      contentVariants: [
        {
          suggestedContent: {
            title: 'Test Content',
            description: 'Test Description',
            url: 'https://test.com'
          },
          messageVariants: [
            {
              tone: 'friendly',
              message: 'Check out this test content!'
            }
          ]
        }
      ]
    },
    error: null
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations for AI services
    (generateContentTopics as jest.Mock).mockResolvedValue(mockGeneratedTopic);
    (generateContentSuggestions as jest.Mock).mockResolvedValue(mockContentSuggestions);
  });

  beforeAll(async () => {
    supabase = await createClient();
    testUser = await createTestUser({ db: supabase });
    testPerson = await createTestPerson({
      db: supabase,
      data: {
        user_id: testUser.id,
        first_name: 'Test',
        last_name: 'Person',
        bio: 'Test bio'
      }
    });
  });

  describe('success cases', () => {
    it('should generate and save content suggestions successfully', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test data
        const testSuggestion = await createTestSuggestion({
          db,
          data: {
            user_id: testUser.id,
            person_id: testPerson.id,
            topic: 'Previous Topic',
            suggestion: {
              title: 'Previous Suggestion',
              contentUrl: 'https://example.com',
              reason: 'Test reason'
            }
          }
        });

        // Call the service
        const result = await getContentSuggestionsForPerson({
          db,
          personId: testPerson.id,
          userId: testUser.id,
          type: 'content'
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          person_id: testPerson.id,
          user_id: testUser.id,
          topic: mockGeneratedTopic.data.topic,
          type: 'content'
        });

        // Verify that the AI services were called with the correct parameters
        expect(generateContentTopics).toHaveBeenCalledWith({
          personSummary: expect.any(String),
          previousTopics: expect.arrayContaining(['Previous Topic']),
          quantity: 2,
          requestedContent: undefined
        });

        expect(generateContentSuggestions).toHaveBeenCalledWith({
          topicPrompt: mockGeneratedTopic.data.prompt,
          previousSuggestionTitles: expect.any(Array)
        });
      });
    });

    it('should handle gift type suggestions', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Call the service with gift type
        const result = await getContentSuggestionsForPerson({
          db,
          personId: testPerson.id,
          userId: testUser.id,
          type: 'gift'
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          person_id: testPerson.id,
          user_id: testUser.id,
          topic: mockGeneratedTopic.data.topic,
          type: 'gift'
        });

        // Verify that the AI services were called with the correct parameters
        expect(generateContentTopics).toHaveBeenCalledWith({
          personSummary: expect.any(String),
          previousTopics: expect.any(Array),
          quantity: 2,
          requestedContent: undefined
        });

        expect(generateContentSuggestions).toHaveBeenCalledWith({
          topicPrompt: mockGeneratedTopic.data.prompt,
          previousSuggestionTitles: expect.any(Array)
        });
      });
    });

    it('should handle requested content', async () => {
      await withTestTransaction(supabase, async (db) => {
        const requestedContent = 'Find content about AI';

        // Call the service with requested content
        const result = await getContentSuggestionsForPerson({
          db,
          personId: testPerson.id,
          userId: testUser.id,
          type: 'content',
          requestedContent
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
        expect(result.data).toHaveLength(1);

        // Verify that the AI service was called with the correct parameters
        expect(generateContentTopics).toHaveBeenCalledWith({
          personSummary: expect.any(String),
          previousTopics: expect.any(Array),
          quantity: 2,
          requestedContent
        });
      });
    });
  });

  describe('error cases', () => {
    it('should handle missing personId', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getContentSuggestionsForPerson({
          db,
          personId: '',
          userId: testUser.id
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(ERRORS.SUGGESTIONS.PERSON_REQUIRED);
      });
    });

    it('should handle generateContentTopics error', async () => {
      await withTestTransaction(supabase, async (db) => {
        const mockError = {
          name: 'Test Error',
          type: 'API_ERROR',
          message: 'Test error message',
          displayMessage: 'Test display message'
        };

        (generateContentTopics as jest.Mock).mockResolvedValue({
          data: null,
          error: mockError
        });

        const result = await getContentSuggestionsForPerson({
          db,
          personId: testPerson.id,
          userId: testUser.id
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(mockError);
      });
    });

    it('should handle generateContentSuggestions error', async () => {
      await withTestTransaction(supabase, async (db) => {
        const mockError = {
          name: 'Test Error',
          type: 'API_ERROR',
          message: 'Test error message',
          displayMessage: 'Test display message'
        };

        (generateContentSuggestions as jest.Mock).mockResolvedValue({
          data: null,
          error: mockError
        });

        const result = await getContentSuggestionsForPerson({
          db,
          personId: testPerson.id,
          userId: testUser.id
        });

        expect(result.data).toBeNull();
        expect(result.error).toEqual(mockError);
      });
    });

    it('should handle unexpected errors', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Mock an unexpected error
        (generateContentTopics as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

        const result = await getContentSuggestionsForPerson({
          db,
          personId: testPerson.id,
          userId: testUser.id
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          ...ERRORS.SUGGESTIONS.FETCH_ERROR,
          details: expect.any(Error)
        });
      });
    });
  });
});
