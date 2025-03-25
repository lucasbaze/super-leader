import { SupabaseClient } from '@supabase/supabase-js';
import { addDays, subDays } from 'date-fns';

import { dateHandler } from '@/lib/dates/helpers';
import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { createTask } from '@/services/tasks/create-task';
import { createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { generateBirthdayTasks } from '../generate-birthday-task';

describe('generateBirthdayTasks', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should generate tasks for birthdays within the next 30 days', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Create test user
        const testUser = await createTestUser({ db });

        // Create people with birthdays in the next 30 days
        const birthdayInTwoWeeks = dateHandler()
          .add(14, 'days')
          .subtract(30, 'years')
          .toISOString();
        const birthdayInAWeek = dateHandler().add(7, 'days').subtract(60, 'years').toISOString();

        await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            birthday: birthdayInTwoWeeks,
            first_name: 'Alice',
            last_name: 'Smith'
          }
        });

        await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            birthday: birthdayInAWeek,
            first_name: 'Bob',
            last_name: 'Johnson'
          }
        });

        // Generate birthday tasks
        const result = await generateBirthdayTasks(db, testUser.id);

        // Verify results
        expect(result.error).toBeNull();
        expect(result.data).toBe(2); // Should create 2 tasks

        // Verify tasks in database
        const { data: tasks } = await db
          .from('task_suggestion')
          .select('*')
          .eq('user_id', testUser.id)
          .eq('trigger', TASK_TRIGGERS.BIRTHDAY_REMINDER);

        expect(tasks).toHaveLength(2);

        // Verify task content and timing
        tasks?.forEach((task) => {
          expect(task.trigger).toBe(TASK_TRIGGERS.BIRTHDAY_REMINDER);
          expect(task.context).toMatchObject({
            context: expect.stringContaining('birthday is coming up'),
            callToAction: expect.stringContaining('plan something special')
          });
          expect(task.suggested_action_type).toBe(SUGGESTED_ACTION_TYPES.SEND_MESSAGE);
          expect(task.suggested_action).toMatchObject({
            messageVariants: expect.arrayContaining([
              expect.objectContaining({
                tone: expect.any(String),
                message: expect.stringContaining('birthday')
              })
            ])
          });
          // Task should be scheduled 7 days before birthday
          const taskDate = dateHandler(task.end_at);
          const originalBirthday = dateHandler(task.end_at).add(7, 'days');
          expect(taskDate.isSame(originalBirthday.subtract(7, 'days'))).toBe(true);
        });
      });
    });

    it('should not generate tasks for birthdays outside the 30-day window', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        const birthdayInThirtyOneDays = dateHandler()
          .add(32, 'days')
          .subtract(18, 'years')
          .toISOString();
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

        // Verify no tasks in database
        const { data: tasks } = await db
          .from('task_suggestion')
          .select('*')
          .eq('user_id', testUser.id)
          .eq('trigger', TASK_TRIGGERS.BIRTHDAY_REMINDER);

        expect(tasks).toHaveLength(0);
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
            trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER,
            context: {
              context: "Alice's birthday is coming up",
              callToAction: "Send birthday wishes for Alice's special day"
            },
            suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE,
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

        // Verify only one task exists
        const { data: tasks } = await db
          .from('task_suggestion')
          .select('*')
          .eq('user_id', testUser.id)
          .eq('trigger', TASK_TRIGGERS.BIRTHDAY_REMINDER);

        expect(tasks).toHaveLength(1);
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
      });
    });
  });
});
