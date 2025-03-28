import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson, createTestSuggestion, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { AuthUser, Person } from '@/types/database';
import { createClient } from '@/utils/supabase/server';
import { generateObject } from '@/vendors/ai';
import { generateSearchObject } from '@/vendors/openai/generate-search-object';

import { createContentSuggestions, ERRORS } from '../create-content-suggestions';

// Mock the chatCompletion function
jest.mock('@/vendors/ai', () => {
  const mockGenerateObject = jest.fn().mockResolvedValue({
    suggestions: [
      {
        title: 'Latest AI Developments',
        contentUrl: 'https://example.com/ai-2024',
        reason: 'Based on interest in AI and technology'
      },
      {
        title: 'Startup Funding Trends',
        contentUrl: 'https://example.com/startup-trends',
        reason: 'Relevant to startup interests'
      }
    ]
  });

  return {
    generateObject: mockGenerateObject
  };
});

jest.mock('@/vendors/openai/generate-search-object', () => {
  const mockGenerateSearchObject = jest.fn().mockResolvedValue({
    data: {
      suggestions: [
        {
          title: 'Latest AI Developments',
          contentUrl: 'https://example.com/ai-2024',
          reason: 'Based on interest in AI and technology'
        },
        {
          title: 'Startup Funding Trends',
          contentUrl: 'https://example.com/startup-trends',
          reason: 'Relevant to startup interests'
        }
      ]
    },
    error: null
  });

  return {
    generateSearchObject: mockGenerateSearchObject
  };
});

describe('createContentSuggestions', () => {
  let supabase: SupabaseClient;
  let testUser: AuthUser;
  let testPerson: Person;

  beforeEach(() => {
    // Clear mock between tests
    jest.mocked(generateObject).mockClear();
  });

  beforeAll(async () => {
    supabase = await createClient();
    testUser = await createTestUser({ db: supabase });
    testPerson = await createTestPerson({
      db: supabase,
      data: {
        user_id: testUser.id,
        first_name: 'test_John',
        last_name: 'Doe',
        bio: 'Software engineer interested in AI'
      }
    });
  });

  describe('success cases', () => {
    it('should create content suggestions with no previous suggestions', async () => {
      // Setup mock response
      jest.mocked(generateSearchObject).mockResolvedValueOnce({
        data: {
          suggestions: [
            {
              title: 'Latest AI Developments',
              contentUrl: 'https://example.com/ai-2024',
              reason: 'Based on interest in AI and technology'
            }
          ]
        },
        error: null
      });

      const result = await createContentSuggestions({
        userContent: 'Find content about AI and technology',
        suggestions: [],
        type: 'content'
      });

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toEqual({
        title: 'Latest AI Developments',
        contentUrl: 'https://example.com/ai-2024',
        reason: 'Based on interest in AI and technology'
      });
    });

    it('should create content suggestions considering previous suggestions', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test suggestions
        const testSuggestion = await createTestSuggestion({
          db,
          data: {
            user_id: testUser.id,
            person_id: testPerson.id,
            suggestion: {
              title: 'Previous AI Article',
              contentUrl: 'https://example.com/old-ai',
              reason: 'Past AI interest'
            }
          }
        });

        // Setup mock response
        jest.mocked(generateSearchObject).mockResolvedValueOnce({
          data: {
            suggestions: [
              {
                title: 'Startup Funding Trends',
                contentUrl: 'https://example.com/startup-trends',
                reason: 'New direction based on previous content'
              }
            ]
          },
          error: null
        });

        const result = await createContentSuggestions({
          userContent: 'Find new content avoiding previous suggestions',
          suggestions: [testSuggestion],
          type: 'content'
        });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(1);
        expect(result.data![0].title).toBe('Startup Funding Trends');
      });
    });
  });

  describe('error cases', () => {
    it('should handle invalid AI response format', async () => {
      // Mock invalid response format
      jest.mocked(generateSearchObject).mockResolvedValueOnce({
        data: null,
        error: {
          name: 'Error',
          message: 'Invalid response format',
          stack: 'Error stack trace'
        }
      });

      const result = await createContentSuggestions({
        userContent: 'Find content',
        suggestions: [],
        type: 'content'
      });

      expect(result.error).toBeDefined();
      expect(result.error?.name).toBe(ERRORS.CONTENT_CREATION.PARSE_ERROR.name);
      expect(result.data).toBeNull();
    });

    it('should handle AI service errors', async () => {
      // Mock API error
      jest.mocked(generateSearchObject).mockRejectedValueOnce(new Error('API Error'));

      const result = await createContentSuggestions({
        userContent: 'Find content',
        suggestions: [],
        type: 'content'
      });

      expect(result.error).toBeDefined();
      expect(result.error?.name).toBe(ERRORS.CONTENT_CREATION.FAILED.name);
      expect(result.data).toBeNull();
    });
  });

  describe('gift suggestions', () => {
    it('should create gift suggestions with no previous suggestions', async () => {
      jest.mocked(generateSearchObject).mockResolvedValueOnce({
        data: {
          suggestions: [
            {
              title: 'Premium Coffee Subscription',
              contentUrl: 'https://example.com/coffee-sub',
              reason: 'Perfect for their interest in specialty coffee'
            }
          ]
        },
        error: null
      });

      const result = await createContentSuggestions({
        userContent: 'Find thoughtful gifts',
        suggestions: [],
        type: 'gift'
      });

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].title).toContain('Coffee Subscription');
    });

    // Add more gift-specific tests...
  });
});
