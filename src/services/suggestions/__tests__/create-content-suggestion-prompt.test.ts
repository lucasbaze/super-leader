import { SupabaseClient } from '@supabase/supabase-js';

import { getPerson } from '@/services/person/get-person';
import {
  createTestInteraction,
  createTestPerson,
  createTestSuggestion,
  createTestUser
} from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { AuthUser, Person } from '@/types/database';
import { createClient } from '@/utils/supabase/server';
import { chatCompletion } from '@/vendors/open-router';

import {
  buildContentSuggestionAugmentationUserPrompt,
  createContentSuggestionPrompt
} from '../create-content-suggestion-prompt';

// Mock the chatCompletion function
jest.mock('@/vendors/open-router', () => {
  const mockChatCompletion = jest.fn().mockResolvedValue({
    role: 'assistant',
    content: JSON.stringify({
      topics: ['technology'],
      prompt: 'Find 3 pieces of content about software development and AI technology'
    })
  });

  return {
    chatCompletion: mockChatCompletion
  };
});

describe('createContentSuggestionPrompt', () => {
  let supabase: SupabaseClient;
  let testUser: AuthUser;
  let testPerson: Person;

  beforeEach(() => {
    // Clear mock between tests
    jest.mocked(chatCompletion).mockClear();
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
    it('should create a prompt with person info and previous interactions', async () => {
      // Setup mock response
      jest.mocked(chatCompletion).mockResolvedValueOnce({
        role: 'assistant',
        refusal: null,
        content: JSON.stringify({
          topics: ['technology'],
          prompt: 'Find 3 pieces of content about software development and AI technology'
        })
      });

      await withTestTransaction(supabase, async (db) => {
        // Create test interactions
        await createTestInteraction({
          db,
          data: {
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'note',
            note: 'Interested in machine learning'
          }
        });

        await createTestInteraction({
          db,
          data: {
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'note',
            note: 'Working on a startup'
          }
        });

        // Get person with interactions using getPerson service
        const personResult = await getPerson({
          db,
          personId: testPerson.id,
          withInteractions: true
        });

        // Add debug logging
        console.log('Person Result:', personResult);

        const result = await createContentSuggestionPrompt({
          personResult: personResult.data!,
          suggestions: []
        });

        // Add debug logging
        console.log('Chat Completion Mock Calls:', jest.mocked(chatCompletion).mock.calls);
        console.log('Chat Completion Mock Results:', jest.mocked(chatCompletion).mock.results);
        console.log('Result:', result);

        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          topics: ['technology'],
          prompt: 'Find 3 pieces of content about software development and AI technology'
        });
      });
    });

    it('should include previous suggestions in the prompt', async () => {
      // Setup mock response
      jest.mocked(chatCompletion).mockResolvedValueOnce({
        role: 'assistant',
        refusal: null,
        content: JSON.stringify({
          topics: ['technology'],
          prompt: 'Find 3 pieces of content about software development and AI technology'
        })
      });
      await withTestTransaction(supabase, async (db) => {
        // Create test suggestions
        const testSuggestion = await createTestSuggestion({
          db,
          data: {
            user_id: testUser.id,
            person_id: testPerson.id,
            suggestion: {
              title: 'AI in 2024',
              contentUrl: 'https://example.com/ai-2024',
              reason: 'Based on interest in AI'
            }
          }
        });

        // Get person with interactions
        const personResult = await getPerson({
          db,
          personId: testPerson.id,
          withInteractions: true
        });

        const result = await createContentSuggestionPrompt({
          personResult: personResult.data!,
          suggestions: [testSuggestion]
        });

        expect(result.error).toBeNull();
        expect(result.data).toBeDefined();
      });
    });
  });

  describe('buildContentSuggestionAugmentationUserPrompt', () => {
    it('should include person name and interactions in prompt', () => {
      const interactions = [
        {
          id: '1',
          type: 'note',
          note: 'Interested in AI',
          person_id: testPerson.id,
          user_id: testUser.id,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'note',
          note: 'Working on ML projects',
          person_id: testPerson.id,
          user_id: testUser.id,
          created_at: new Date().toISOString()
        }
      ];

      const { prompt } = buildContentSuggestionAugmentationUserPrompt({
        personResult: {
          person: testPerson,
          interactions
        },
        suggestions: []
      });

      expect(prompt).toContain('John');
      expect(prompt).toContain('Interested in AI');
      expect(prompt).toContain('Working on ML projects');
    });

    it('should include previous suggestion titles in prompt', () => {
      const suggestions = [
        {
          id: '1',
          suggestion: {
            title: 'AI in 2024',
            contentUrl: 'https://example.com/ai-2024',
            reason: 'Based on interest in AI'
          },
          person_id: testPerson.id,
          user_id: testUser.id,
          created_at: new Date().toISOString(),
          type: 'content',
          viewed: false,
          saved: false,
          bad: false
        }
      ];

      const { prompt } = buildContentSuggestionAugmentationUserPrompt({
        personResult: {
          person: testPerson,
          interactions: []
        },
        suggestions
      });

      expect(prompt).toContain('AI in 2024');
      expect(prompt).toContain('previous suggestions');
    });

    it('should handle empty interactions and suggestions', () => {
      const { prompt } = buildContentSuggestionAugmentationUserPrompt({
        personResult: {
          person: testPerson,
          interactions: []
        },
        suggestions: []
      });

      expect(prompt).toContain('John');
      expect(prompt).not.toContain('previous suggestions');
    });
  });
});
