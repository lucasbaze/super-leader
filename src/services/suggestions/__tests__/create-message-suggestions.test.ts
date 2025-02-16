import { createTestInteraction } from '@/tests/test-builder/create-interaction';
import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { DBClient } from '@/types/database';
import { createClient } from '@/utils/supabase/server';
import { generateObject } from '@/vendors/ai';

import { createMessageSuggestions, ERRORS } from '../create-message-suggestions';

jest.mock('@/vendors/ai');
const mockOpenAI = generateObject as jest.MockedFunction<typeof generateObject>;

describe('createMessageSuggestions', () => {
  let db: DBClient;
  let testUser: { id: string };
  let testPerson: { id: string };

  const testContent = {
    contentUrl: 'https://example.com/article',
    contentTitle: 'Test Article About AI'
  };

  beforeAll(async () => {
    db = await createClient();
    testUser = await createTestUser({ db });
  });

  beforeEach(async () => {
    mockOpenAI.mockClear();

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
        note: 'Interested in technology'
      }
    });

    await createTestInteraction({
      db,
      data: {
        person_id: testPerson.id,
        user_id: testUser.id,
        type: 'note',
        note: 'Works in software development'
      }
    });
  });

  describe('success cases', () => {
    it('should return message suggestions when AI returns valid response', async () => {
      const mockSuggestions = [
        {
          text: 'Hey! Saw this article about AI and thought of our tech chat last week.',
          tone: 'casual' as const
        },
        {
          text: 'Found an interesting piece on AI that aligns with your work in software development.',
          tone: 'professional' as const
        }
      ];

      mockOpenAI.mockResolvedValueOnce({ suggestions: mockSuggestions });

      const result = await createMessageSuggestions({
        db,
        personId: testPerson.id,
        ...testContent
      });

      expect(result.error).toBeNull();
      expect(result.data).toEqual(mockSuggestions);
    });
  });

  describe('error cases', () => {
    it('should return error when personId is not provided', async () => {
      const result = await createMessageSuggestions({
        db,
        personId: '',
        ...testContent
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(ERRORS.MESSAGE_SUGGESTIONS.PERSON_REQUIRED);
    });

    it('should return error when content information is missing', async () => {
      const result = await createMessageSuggestions({
        db,
        personId: testPerson.id,
        contentUrl: '',
        contentTitle: ''
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(ERRORS.MESSAGE_SUGGESTIONS.CONTENT_REQUIRED);
    });

    it('should return error when person does not exist', async () => {
      const result = await createMessageSuggestions({
        db,
        personId: 'non-existent-id',
        ...testContent
      });

      expect(result.data).toBeNull();
      expect(result.error?.name).toBe('person_not_found');
    });

    it('should handle AI service errors', async () => {
      mockOpenAI.mockRejectedValueOnce(new Error('AI service error'));

      const result = await createMessageSuggestions({
        db,
        personId: testPerson.id,
        ...testContent
      });

      expect(result.data).toBeNull();
      expect(result.error).toEqual(
        expect.objectContaining({
          ...ERRORS.MESSAGE_SUGGESTIONS.GENERATION_ERROR,
          details: expect.any(Error)
        })
      );
    });
  });

  describe('prompt construction', () => {
    it('should include person name and interactions in prompt', async () => {
      mockOpenAI.mockResolvedValueOnce([]);

      await createMessageSuggestions({
        db,
        personId: testPerson.id,
        ...testContent
      });

      const params = mockOpenAI.mock.calls[0][0];
      const userMessage = params.messages[1].content;

      expect(userMessage).toContain('John');
      expect(userMessage).toContain('Interested in technology');
      expect(userMessage).toContain('Works in software development');
    });

    it('should use system prompt with correct JSON format', async () => {
      mockOpenAI.mockResolvedValueOnce({ suggestions: [] });

      await createMessageSuggestions({
        db,
        personId: testPerson.id,
        ...testContent
      });

      const params = mockOpenAI.mock.calls[0][0];
      const systemMessage = params.messages[0].content;

      expect(systemMessage).toContain('ALWAYS RETURN JSON CONTENT');
      expect(systemMessage).toContain('"suggestions": [');
      expect(systemMessage).toContain('"text":');
      expect(systemMessage).toContain('"tone":');
    });
  });
});
