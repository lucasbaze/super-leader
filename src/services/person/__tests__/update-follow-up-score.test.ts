import { createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { AuthUser, DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

import { calculateFollowUpScore } from '../calculate-follow-up-score';
import { ERRORS, updateFollowUpScore } from '../update-follow-up-score';

// Mock calculateFollowUpScore
jest.mock('../calculate-follow-up-score');

describe('updateFollowUpScore', () => {
  let supabase: DBClient;
  let testUser: AuthUser;

  beforeAll(async () => {
    supabase = await createClient();
    testUser = await createTestUser({ db: supabase });
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('success cases', () => {
    it('should update score manually', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test person
        const person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            bio: 'Original bio'
          }
        });

        // Update with manual score
        const result = await updateFollowUpScore({
          db,
          personId: person.id,
          manualScore: 0.75
        });

        // Verify result
        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          score: 0.75,
          reason: 'Manually set score'
        });

        // Verify database update
        const { data: updatedPerson } = await db
          .from('person')
          .select('follow_up_score')
          .eq('id', person.id)
          .single();

        expect(updatedPerson?.follow_up_score).toBe(0.75);
      });
    });

    it('should update score using calculated value', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test person
        const person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            bio: 'Original bio'
          }
        });

        // Mock calculated score
        jest.mocked(calculateFollowUpScore).mockResolvedValueOnce({
          data: { score: 0.5, reason: 'Test calculated score' },
          error: null
        });

        // Update with calculated score
        const result = await updateFollowUpScore({
          db,
          personId: person.id
        });

        // Verify result
        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          score: 0.5,
          reason: 'Test calculated score'
        });

        // Verify database update
        const { data: updatedPerson } = await db
          .from('person')
          .select('follow_up_score')
          .eq('id', person.id)
          .single();

        expect(updatedPerson?.follow_up_score).toBe(0.5);
      });
    });
  });

  describe('error cases', () => {
    it('should return error if personId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await updateFollowUpScore({
          db,
          personId: ''
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.UPDATE.PERSON_REQUIRED);
      });
    });

    it('should handle database errors', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await updateFollowUpScore({
          db,
          personId: 'non-existent-id',
          manualScore: 0.5
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          ...ERRORS.UPDATE.FAILED,
          details: expect.any(Object)
        });
      });
    });

    it('should handle calculation errors', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test person
        const person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            bio: 'Original bio'
          }
        });

        const calculateFollowUpScoreError = {
          name: 'TestError',
          type: ErrorType.API_ERROR,
          message: 'Test error',
          displayMessage: 'Test error'
        };
        // Mock calculation error
        jest.mocked(calculateFollowUpScore).mockResolvedValueOnce({
          data: null,
          error: calculateFollowUpScoreError
        });

        const result = await updateFollowUpScore({
          db,
          personId: person.id
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(calculateFollowUpScoreError);
      });
    });
  });
});
