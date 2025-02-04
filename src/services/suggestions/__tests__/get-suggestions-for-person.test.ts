import { createTestInteraction } from '@/tests/test-builder/create-interaction';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { DBClient } from '@/types/database';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, getSuggestionsForPerson } from '../get-suggestions-for-person';
import { callPerplexityAPI } from '../perplexity-api';

jest.mock('../perplexity-api');
const mockPerplexityAPI = callPerplexityAPI as jest.MockedFunction<typeof callPerplexityAPI>;

describe('getSuggestionsForPerson', () => {
  let db: DBClient;
  let testUser: { id: string };
  let testPerson: { id: string };

  // Helper function to create mock responses
  const createMockResponse = (content: any, ok = true) => {
    return Promise.resolve(
      new Response(JSON.stringify(content), {
        status: ok ? 200 : 400,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );
  };

  beforeAll(async () => {
    db = await createClient();
    testUser = await createTestUser({ db });
  });

  beforeEach(async () => {
    mockPerplexityAPI.mockClear();

    // Create a test person with interactions for each test
    testPerson = await createTestPerson({
      db,
      data: {
        user_id: testUser.id,
        first_name: 'John',
        last_name: 'Doe'
      }
    });

    // Create test interactions
    await createTestInteraction({
      db,
      data: {
        person_id: testPerson.id,
        user_id: testUser.id,
        type: 'note',
        note: 'Likes programming'
      }
    });

    await createTestInteraction({
      db,
      data: {
        person_id: testPerson.id,
        user_id: testUser.id,
        type: 'note',
        note: 'Interested in AI'
      }
    });
  });

  describe('success cases', () => {
    it('should return suggestions when AI returns valid JSON response', async () => {
      const mockSuggestions = [
        {
          contentUrl: 'https://example.com/1',
          title: 'Programming Tips',
          reason: 'Based on interest in programming'
        }
      ];

      mockPerplexityAPI.mockImplementationOnce(() =>
        createMockResponse({
          choices: [
            {
              message: {
                content: '```json\n' + JSON.stringify(mockSuggestions) + '\n```'
              }
            }
          ]
        })
      );

      const result = await getSuggestionsForPerson({
        db,
        personId: testPerson.id
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockSuggestions);
    });

    it('should handle AI response with no JSON markers', async () => {
      mockPerplexityAPI.mockImplementationOnce(() =>
        createMockResponse({
          choices: [
            {
              message: {
                content: 'Some non-JSON response'
              }
            }
          ]
        })
      );

      const result = await getSuggestionsForPerson({
        db,
        personId: testPerson.id
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual([]);
    });
  });

  describe('error cases', () => {
    it('should return error when personId is not provided', async () => {
      const result = await getSuggestionsForPerson({
        db,
        personId: ''
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(ERRORS.SUGGESTIONS.PERSON_REQUIRED);
    });

    it('should return error when person does not exist', async () => {
      const result = await getSuggestionsForPerson({
        db,
        personId: 'non-existent-id'
      });

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe('person_not_found');
    });

    it('should return error when AI service fails', async () => {
      mockPerplexityAPI.mockImplementationOnce(() =>
        createMockResponse({ error: 'AI service error' }, false)
      );

      const result = await getSuggestionsForPerson({
        db,
        personId: testPerson.id
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(
        expect.objectContaining({
          ...ERRORS.SUGGESTIONS.AI_SERVICE_ERROR,
          details: { error: 'AI service error' }
        })
      );
    });

    it('should handle network errors from AI service', async () => {
      mockPerplexityAPI.mockRejectedValueOnce(new Error('Network error'));

      const result = await getSuggestionsForPerson({
        db,
        personId: testPerson.id
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(
        expect.objectContaining({
          ...ERRORS.SUGGESTIONS.FETCH_ERROR,
          details: expect.any(Error)
        })
      );
    });

    it('should handle malformed JSON in AI response', async () => {
      mockPerplexityAPI.mockImplementationOnce(() =>
        createMockResponse({
          choices: [
            {
              message: {
                content: '```json\n{malformed json}\n```'
              }
            }
          ]
        })
      );

      const result = await getSuggestionsForPerson({
        db,
        personId: testPerson.id
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(
        expect.objectContaining({
          ...ERRORS.SUGGESTIONS.FETCH_ERROR,
          details: expect.any(Error)
        })
      );
    });
  });

  describe('AI prompt construction', () => {
    it('should include person name and interactions in prompt', async () => {
      mockPerplexityAPI.mockImplementationOnce(() =>
        createMockResponse({
          choices: [
            {
              message: {
                content: '```json\n[]\n```'
              }
            }
          ]
        })
      );

      await getSuggestionsForPerson({
        db,
        personId: testPerson.id
      });

      const [messages] = mockPerplexityAPI.mock.calls[0];
      const userMessage = messages[1].content;

      expect(userMessage).toContain('John');
      expect(userMessage).toContain('Likes programming');
      expect(userMessage).toContain('Interested in AI');
    });
  });
});
