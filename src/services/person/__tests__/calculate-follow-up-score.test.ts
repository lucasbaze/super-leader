import { randomUUID } from 'crypto';

import { dateHandler } from '@/lib/dates/helpers';
import {
  createTestGroup,
  createTestGroupMember,
  createTestInteraction,
  createTestPerson,
  createTestUser
} from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { AuthUser, DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { createClient } from '@/utils/supabase/server';

import { calculateFollowUpScore, ERRORS } from '../calculate-follow-up-score';
import { generateFollowUpScore } from '../generate-follow-up-score';

// Mock the generate-follow-up-score module
jest.mock('../generate-follow-up-score');

describe('calculateFollowUpScore', () => {
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
    it('should return immediate score of 1 when today is birthday', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test person with today's date as birthday
        const today = dateHandler().utc();
        const birthday = dateHandler()
          .utc()
          .year(1990)
          .month(today.month())
          .date(today.date())
          .startOf('day');

        const person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            birthday: birthday.toISOString()
          }
        });

        const result = await calculateFollowUpScore({
          db,
          personId: person.id
        });

        console.log('Result', result);

        // Verify result is birthday score
        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          score: 1,
          reason: 'Today is their birthday'
        });

        // Verify generateFollowUpScore was not called
        expect(generateFollowUpScore).not.toHaveBeenCalled();
      });
    });

    it('should proceed with normal calculation when not birthday', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test person with tomorrow's date as birthday
        const tomorrow = dateHandler().utc().add(1, 'day');
        const birthday = dateHandler()
          .utc()
          .year(1990)
          .month(tomorrow.month())
          .date(tomorrow.date())
          .startOf('day');

        const person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe',
            birthday: birthday.toISOString()
          }
        });

        // Mock generated score
        jest.mocked(generateFollowUpScore).mockResolvedValueOnce({
          data: { score: 0.5, reason: 'Test generated score' },
          error: null
        });

        const result = await calculateFollowUpScore({
          db,
          personId: person.id
        });

        // Verify normal calculation occurred
        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          score: 0.5,
          reason: 'Test generated score'
        });

        // Verify generateFollowUpScore was called
        expect(generateFollowUpScore).toHaveBeenCalled();
      });
    });

    it('should calculate score for person with interactions and groups', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test person
        const person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        // Create test group
        const group = await createTestGroup({
          db,
          data: {
            user_id: testUser.id,
            name: 'Test Group',
            slug: 'test-group'
          }
        });

        // Add person to group
        await createTestGroupMember({
          db,
          data: {
            group_id: group.id,
            person_id: person.id,
            user_id: testUser.id
          }
        });

        // Create test interaction
        await createTestInteraction({
          db,
          data: {
            person_id: person.id,
            user_id: testUser.id,
            type: 'note',
            note: 'Test interaction'
          }
        });

        // Mock generated score
        jest.mocked(generateFollowUpScore).mockResolvedValueOnce({
          data: { score: 0.75, reason: 'Test generated score' },
          error: null
        });

        // Calculate score
        const result = await calculateFollowUpScore({
          db,
          personId: person.id
        });

        // Verify result
        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          score: 0.75,
          reason: 'Test generated score'
        });

        // Verify generateFollowUpScore was called with correct data
        expect(generateFollowUpScore).toHaveBeenCalledWith(
          expect.objectContaining({
            person: expect.objectContaining({
              id: person.id,
              first_name: 'John',
              last_name: 'Doe'
            }),
            interactions: expect.arrayContaining([
              expect.objectContaining({
                type: 'note',
                note: 'Test interaction'
              })
            ]),
            groups: expect.arrayContaining([
              expect.objectContaining({
                name: 'Test Group',
                slug: 'test-group'
              })
            ])
          })
        );
      });
    });
  });

  describe('error cases', () => {
    it('should return error if personId is empty', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await calculateFollowUpScore({
          db,
          personId: ''
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.CALCULATION.PERSON_NOT_FOUND.name,
          type: ErrorType.NOT_FOUND
        });
      });
    });

    it('should return error if person not found', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await calculateFollowUpScore({
          db,
          personId: randomUUID()
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject({
          name: ERRORS.CALCULATION.PERSON_NOT_FOUND.name,
          type: ErrorType.NOT_FOUND
        });
      });
    });

    it('should handle generation errors', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test person
        const person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        const generateError = {
          name: 'TestError',
          type: ErrorType.API_ERROR,
          message: 'Test error',
          displayMessage: 'Test error'
        };

        // Mock generation error
        jest.mocked(generateFollowUpScore).mockResolvedValueOnce({
          data: null,
          error: generateError
        });

        const result = await calculateFollowUpScore({
          db,
          personId: person.id
        });

        expect(result.data).toBeNull();
        expect(result.error?.name).toEqual(ERRORS.CALCULATION.GENERATION_FAILED.name);
      });
    });
  });
});
