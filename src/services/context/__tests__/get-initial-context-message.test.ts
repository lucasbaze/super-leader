import { createTestUser, createTestUserContext, createTestUserProfile } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { AuthUser, DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';
import { generateObject } from '@/vendors/ai';

import {
  ContextMessageSchema,
  ERRORS as GENERATION_ERRORS
} from '../generate-initial-context-message';
import { ERRORS, getInitialContextMessage } from '../get-initial-context-message';

// Mock the generateObject function
jest.mock('@/vendors/ai', () => ({
  generateObject: jest.fn()
}));

describe('getInitialContextMessage', () => {
  let supabase: DBClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('success cases', () => {
    it('should generate initial context message with no existing context', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db: supabase });
        // Create user profile with no context
        const profile = await createTestUserProfile({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            context_summary_completeness_score: 0
          }
        });

        // Mock AI response
        const mockResponse = {
          initialQuestion: "Hi! I'd love to get to know you better. What brings you here today?",
          followUpQuestions: [
            'What are your main goals right now?',
            'How do you like to spend your time?'
          ],
          priority: 1,
          reasoning: 'Starting with basic introduction since no context exists'
        };

        jest.mocked(generateObject).mockResolvedValueOnce(mockResponse);

        const result = await getInitialContextMessage({
          db,
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toEqual(mockResponse);

        // Verify generateObject was called with correct parameters
        expect(generateObject).toHaveBeenCalledWith({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system'
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('Completeness Score: 0%')
            })
          ]),
          schema: ContextMessageSchema
        });
      });
    });

    it('should include existing context in prompt', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db: supabase });

        // Create user profile with existing context
        const profile = await createTestUserProfile({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            context_summary: { interests: ['coding', 'music'] },
            context_summary_completeness_score: 25
          }
        });

        // Mock AI response
        const mockResponse = {
          initialQuestion:
            "That's interesting that you're into music! What kind of genres do you enjoy playing on piano?",
          followUpQuestions: [
            'How does your startup journey align with your musical interests?',
            'What other creative outlets do you enjoy?'
          ],
          priority: 2,
          reasoning: 'Building on existing context about music and career'
        };

        jest.mocked(generateObject).mockResolvedValueOnce(mockResponse);

        const result = await getInitialContextMessage({
          db,
          userId: testUser.id
        });

        expect(result.error).toBeNull();
        expect(result.data).toEqual(mockResponse);

        // Verify generateObject was called with context
        expect(generateObject).toHaveBeenCalledWith({
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system'
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('Completeness Score: 25%')
            }),
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('"interests":["coding","music"]')
            })
          ]),
          schema: ContextMessageSchema
        });
      });
    });
  });

  describe('error cases', () => {
    it('should return error if user profile not found', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getInitialContextMessage({
          db,
          userId: 'non-existent-id'
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.CALCULATION.USER_NOT_FOUND.name,
          type: ErrorType.NOT_FOUND
        });
      });
    });

    it('should handle generation errors', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db: supabase });
        // Create basic user profile
        await createTestUserProfile({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        // Mock generation error
        jest.mocked(generateObject).mockRejectedValueOnce(new Error('AI service error'));

        const result = await getInitialContextMessage({
          db,
          userId: testUser.id
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: GENERATION_ERRORS.GENERATION.FAILED.name,
          type: GENERATION_ERRORS.GENERATION.FAILED.type
        });
      });
    });
  });
});
