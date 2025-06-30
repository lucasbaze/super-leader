import { SupabaseClient } from '@supabase/supabase-js';

import { dateHandler } from '@/lib/dates/helpers';
import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { createTask } from '@/services/tasks/create-task';
import { createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

// Import the mocked function
import { buildTask } from '../../build-task-from-trigger';
import { generateBirthdayTasks } from '../generate-birthday-task';

// Mock the buildTask function
jest.mock('../../build-task', () => ({
  buildTask: jest.fn().mockImplementation(({ userId, personId, trigger, endAt, context }) => {
    return Promise.resolve({
      data: {
        id: 'mock-task-id',
        user_id: userId,
        person_id: personId,
        trigger,
        end_at: endAt,
        context
      },
      error: null
    });
  })
}));

describe('generateBirthdayTasks', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  beforeEach(() => {
    // Clear mock between tests
    jest.mocked(buildTask).mockClear();
  });

  describe('success cases', () => {
    it.skip('should generate tasks for birthdays within the next 30 days', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user
        const testUser = await createTestUser({ db });

        // Create people with birthdays in the next 30 days
        const birthdayInTwoWeeks = dateHandler().add(14, 'days').subtract(30, 'years').toISOString();
        const birthdayInAWeek = dateHandler().add(7, 'days').subtract(60, 'years').toISOString();

        const person1 = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            birthday: birthdayInTwoWeeks,
            first_name: 'Alice',
            last_name: 'Smith'
          }
        });

        const person2 = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            birthday: birthdayInAWeek,
            first_name: 'Bob',
            last_name: 'Johnson'
          }
        });

        jest.mocked(buildTask).mockResolvedValue({
          data: {
            // @ts-ignore
            id: 'mock-task-id'
          },
          error: null
        });

        // Generate birthday tasks
        const result = await generateBirthdayTasks(db, testUser.id);

        console.log('result', result);
        // Verify results
        expect(result.error).toBeNull();
        expect(result.data).toBe(2); // Should create 2 tasks

        // Verify buildTask was called correctly for each person
        expect(buildTask).toHaveBeenCalledTimes(2);

        // Verify first task parameters
        expect(buildTask).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUser.id,
            personId: person1.id,
            trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
            endAt: dateHandler(birthdayInTwoWeeks).subtract(7, 'days').startOf('day').toISOString(),
            context: expect.stringContaining('test_Alice has a birthday coming up')
          })
        );

        // Verify second task parameters
        expect(buildTask).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: testUser.id,
            personId: person2.id,
            trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
            endAt: dateHandler(birthdayInAWeek).subtract(7, 'days').startOf('day').toISOString(),
            context: expect.stringContaining('test_Bob has a birthday coming up')
          })
        );
      });
    });

    it('should not generate tasks for birthdays outside the 30-day window', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const birthdayInThirtyOneDays = dateHandler().add(32, 'days').subtract(18, 'years').toISOString();
        await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            birthday: birthdayInThirtyOneDays,
            first_name: 'Charlie',
            last_name: 'Brown'
          }
        });

        const result = await generateBirthdayTasks(db, testUser.id);

        expect(result.error).toBeNull();
        expect(result.data).toBe(0); // Should create no tasks
        expect(buildTask).not.toHaveBeenCalled();
      });
    });

    it('should not create duplicate tasks for birthdays that already have tasks', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create person with birthday in 2 weeks
        const birthdayInTwoWeeks = dateHandler().add(14, 'days').toISOString();
        const person = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            birthday: birthdayInTwoWeeks,
            first_name: 'Alice',
            last_name: 'Smith'
          }
        });

        // Create existing birthday task
        await createTask({
          db,
          task: {
            userId: testUser.id,
            personId: person.id,
            trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
            context: {
              context: "Alice's birthday is coming up",
              callToAction: "Send birthday wishes for Alice's special day"
            },
            suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
            suggestedAction: {
              messageVariants: [
                {
                  tone: 'friendly',
                  message: 'Happy birthday! Hope you have a fantastic day!'
                }
              ]
            },
            endAt: dateHandler(birthdayInTwoWeeks).subtract(7, 'days').toISOString()
          }
        });

        // Try to generate birthday tasks
        const result = await generateBirthdayTasks(db, testUser.id);

        expect(result.error).toBeNull();
        expect(result.data).toBe(0); // Should create no new tasks
        expect(buildTask).not.toHaveBeenCalled();
      });
    });

    it('should handle people with no birth date set', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Create person with no birth date
        await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Alice',
            last_name: 'Smith'
          }
        });

        const result = await generateBirthdayTasks(db, testUser.id);

        expect(result.error).toBeNull();
        expect(result.data).toBe(0); // Should create no tasks
        expect(buildTask).not.toHaveBeenCalled();
      });
    });
  });

  describe('error cases', () => {
    it('should handle database errors gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Use an invalid user ID to trigger a foreign key error
        const result = await generateBirthdayTasks(db, 'invalid-user-id');

        expect(result.error).toBeDefined();
        expect(result.error?.name).toBe('fetching_birthdays_failed');
        expect(result.data).toBeNull();
        expect(buildTask).not.toHaveBeenCalled();
      });
    });
  });
});
