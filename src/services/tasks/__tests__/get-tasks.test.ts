import { SupabaseClient } from '@supabase/supabase-js';
import { addDays } from 'date-fns';

import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createTask } from '../create-task';
import { ERRORS, getTasks } from '../get-tasks';
import { validateTaskSuggestion } from '../validate-task-suggestion';

describe('getTasks service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should return empty array when user has no tasks', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const result = await getTasks({ db, userId: testUser.id });

        expect(result.data).toEqual([]);
        expect(result.error).toBeNull();
      });
    });

    it('should return tasks with person data', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        const taskData = {
          userId: testUser.id,
          personId: testPerson.id,
          trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
          context: {
            context: 'Birthday coming up next week',
            callToAction: 'Send a thoughtful birthday message'
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
          endAt: addDays(new Date(), 1).toISOString()
        };

        const testTask = await createTask({
          db,
          task: taskData
        });

        const result = await getTasks({ db, userId: testUser.id });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          id: testTask.data!.id,
          trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
          context: taskData.context,
          suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
          suggestedAction: taskData.suggestedAction,
          person: {
            id: testPerson.id,
            firstName: 'test_John',
            lastName: 'test_Doe'
          }
        });
      });
    });

    it('should only return active tasks', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        const taskData = {
          userId: testUser.id,
          personId: testPerson.id,
          trigger: TASK_TRIGGERS.CONTEXT_GATHER.slug,
          context: {
            context: 'Need to gather more information',
            callToAction: 'Ask about their interests'
          },
          suggestedActionType: SUGGESTED_ACTION_TYPES.ADD_NOTE.slug,
          suggestedAction: {
            questionVariants: [
              {
                type: 'interests',
                question: 'What are your hobbies?'
              }
            ]
          },
          endAt: addDays(new Date(), 1).toISOString()
        };

        // Create active task
        await createTask({
          db,
          task: taskData
        });

        // Mark task as completed
        await db.from('task_suggestion').update({ completed_at: new Date().toISOString() }).eq('user_id', testUser.id);

        const result = await getTasks({ db, userId: testUser.id });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(0);
      });
    });

    it('should only return tasks for the specified user', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser1 = await createTestUser({ db });
        const testUser2 = await createTestUser({ db });

        const testPerson1 = await createTestPerson({
          db,
          data: {
            user_id: testUser1.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

        const testPerson2 = await createTestPerson({
          db,
          data: {
            user_id: testUser2.id,
            first_name: 'Jane',
            last_name: 'Smith'
          }
        });

        // Create task for first user
        const taskData1 = {
          userId: testUser1.id,
          personId: testPerson1.id,
          trigger: TASK_TRIGGERS.EXTERNAL_NEWS.slug,
          context: {
            context: 'Found an interesting article',
            callToAction: 'Share the article about AI'
          },
          suggestedActionType: SUGGESTED_ACTION_TYPES.SHARE_CONTENT.slug,
          suggestedAction: {
            contentVariants: [
              {
                suggestedContent: {
                  title: 'Latest AI Developments',
                  description: 'An article about recent breakthroughs in AI',
                  url: 'https://example.com/ai-article'
                },
                messageVariants: [
                  {
                    tone: 'professional',
                    message: 'Thought you might find this interesting given your work in AI'
                  }
                ]
              }
            ]
          },
          endAt: addDays(new Date(), 1).toISOString()
        };

        const taskValidation1 = validateTaskSuggestion(taskData1);
        expect(taskValidation1.valid).toBe(true);
        await createTask({
          db,
          task: taskData1
        });

        // Create task for second user
        const taskData2 = {
          userId: testUser2.id,
          personId: testPerson2.id,
          trigger: TASK_TRIGGERS.EXTERNAL_NEWS.slug,
          context: {
            context: 'Found an interesting article',
            callToAction: 'Share the article about AI'
          },
          suggestedActionType: SUGGESTED_ACTION_TYPES.SHARE_CONTENT.slug,
          suggestedAction: {
            contentVariants: [
              {
                suggestedContent: {
                  title: 'Latest AI Developments',
                  description: 'An article about recent breakthroughs in AI',
                  url: 'https://example.com/ai-article'
                },
                messageVariants: [
                  {
                    tone: 'professional',
                    message: 'Thought you might find this interesting given your work in AI'
                  }
                ]
              }
            ]
          },
          endAt: addDays(new Date(), 1).toISOString()
        };

        const taskValidation2 = validateTaskSuggestion(taskData2);
        expect(taskValidation2.valid).toBe(true);
        await createTask({
          db,
          task: taskData2
        });

        const result = await getTasks({ db, userId: testUser1.id });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(1);
        expect(result.data![0].person).toMatchObject({
          firstName: 'test_John',
          lastName: 'test_Doe'
        });
      });
    });
  });

  describe('validation cases', () => {
    it('should return error when userId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getTasks({ db, userId: '' });

        expect(result.error).toBeDefined();
        expect(result.error).toEqual(ERRORS.TASKS.MISSING_USER_ID);
        expect(result.data).toBeNull();
      });
    });
  });

  describe('error cases', () => {
    it('should handle database errors gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });

        // Mock the database query to throw an error
        jest.spyOn(db, 'from').mockImplementationOnce(() => {
          throw new Error('Database connection error');
        });

        const result = await getTasks({ db, userId: testUser.id });

        expect(result.error).toBeDefined();
        expect(result.error).toMatchObject({
          name: ERRORS.TASKS.FETCH_ERROR.name,
          type: ERRORS.TASKS.FETCH_ERROR.type,
          displayMessage: ERRORS.TASKS.FETCH_ERROR.displayMessage
        });
        expect(result.data).toBeNull();
      });
    });
  });
});
