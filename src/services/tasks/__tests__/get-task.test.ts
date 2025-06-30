import { SupabaseClient } from '@supabase/supabase-js';
import { addDays } from 'date-fns';

import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createTask } from '../create-task';
import { ERRORS, getTask } from '../get-task';

describe('getTask service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should return task with person data when task exists', async () => {
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

        // Verify task was created successfully
        expect(testTask.data).not.toBeNull();
        expect(testTask.error).toBeNull();

        const result = await getTask({ db, taskId: testTask.data!.id });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testTask.data!.id,
          trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
          context: taskData.context,
          suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
          suggestedAction: taskData.suggestedAction,
          person: {
            id: testPerson.id,
            firstName: 'John',
            lastName: 'Doe'
          }
        });
        expect(result.data?.endAt).toBeDefined();
        expect(result.data?.completedAt).toBeNull();
        expect(result.data?.skippedAt).toBeNull();
        expect(result.data?.snoozedAt).toBeNull();
      });
    });

    it('should return task with different action types correctly formatted', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Jane',
            last_name: 'Smith'
          }
        });

        const taskData = {
          userId: testUser.id,
          personId: testPerson.id,
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

        const testTask = await createTask({
          db,
          task: taskData
        });

        // Verify task was created successfully
        expect(testTask.data).not.toBeNull();
        expect(testTask.error).toBeNull();

        const result = await getTask({ db, taskId: testTask.data!.id });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testTask.data!.id,
          trigger: TASK_TRIGGERS.EXTERNAL_NEWS.slug,
          context: taskData.context,
          suggestedActionType: SUGGESTED_ACTION_TYPES.SHARE_CONTENT.slug,
          suggestedAction: taskData.suggestedAction,
          person: {
            id: testPerson.id,
            firstName: 'Jane',
            lastName: 'Smith'
          }
        });
      });
    });

    it('should return task with completed status when task is completed', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'Bob',
            last_name: 'Johnson'
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
                type: 'professional',
                question: 'What are your hobbies?'
              }
            ]
          },
          endAt: addDays(new Date(), 1).toISOString()
        };

        const testTask = await createTask({
          db,
          task: taskData
        });

        // Verify task was created successfully
        expect(testTask.data).not.toBeNull();
        expect(testTask.error).toBeNull();

        // Mark task as completed
        const completedAt = new Date().toISOString();
        await db.from('task_suggestion').update({ completed_at: completedAt }).eq('id', testTask.data!.id);

        const result = await getTask({ db, taskId: testTask.data!.id });

        expect(result.error).toBeNull();
        expect(result.data).toMatchObject({
          id: testTask.data!.id,
          person: {
            id: testPerson.id,
            firstName: 'Bob',
            lastName: 'Johnson'
          }
        });
        expect(result.data?.completedAt).toBeDefined();
      });
    });
  });

  describe('validation cases', () => {
    it('should return error when taskId is missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getTask({ db, taskId: '' });

        expect(result.error).toBeDefined();
        expect(result.error).toEqual(ERRORS.TASKS.MISSING_TASK_ID);
        expect(result.data).toBeNull();
      });
    });

    it('should return error when taskId is null', async () => {
      await withTestTransaction(supabase, async (db) => {
        // @ts-expect-error - Testing null case
        const result = await getTask({ db, taskId: null });

        expect(result.error).toBeDefined();
        expect(result.error).toEqual(ERRORS.TASKS.MISSING_TASK_ID);
        expect(result.data).toBeNull();
      });
    });

    it('should return error when taskId is undefined', async () => {
      await withTestTransaction(supabase, async (db) => {
        // @ts-expect-error - Testing undefined case
        const result = await getTask({ db, taskId: undefined });

        expect(result.error).toBeDefined();
        expect(result.error).toEqual(ERRORS.TASKS.MISSING_TASK_ID);
        expect(result.data).toBeNull();
      });
    });
  });

  describe('error cases', () => {
    it('should return not found error for non-existent task', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getTask({ db, taskId: crypto.randomUUID() });

        expect(result.error).toMatchObject({
          name: ERRORS.TASKS.TASK_NOT_FOUND.name,
          type: ERRORS.TASKS.TASK_NOT_FOUND.type,
          displayMessage: ERRORS.TASKS.TASK_NOT_FOUND.displayMessage
        });
        expect(result.data).toBeNull();
      });
    });

    it('should handle database errors gracefully', async () => {
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

        // Verify task was created successfully
        expect(testTask.data).not.toBeNull();
        expect(testTask.error).toBeNull();

        // Mock the database query to throw an error
        jest.spyOn(db, 'from').mockImplementationOnce(() => {
          throw new Error('Database connection error');
        });

        const result = await getTask({ db, taskId: testTask.data!.id });

        expect(result.error).toBeDefined();
        expect(result.error).toMatchObject({
          name: ERRORS.TASKS.FETCH_ERROR.name,
          type: ERRORS.TASKS.FETCH_ERROR.type,
          displayMessage: ERRORS.TASKS.FETCH_ERROR.displayMessage
        });
        expect(result.data).toBeNull();
      });
    });

    it('should handle invalid UUID format gracefully', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await getTask({ db, taskId: 'invalid-uuid-format' });

        expect(result.error).toMatchObject({
          name: ERRORS.TASKS.TASK_NOT_FOUND.name,
          type: ERRORS.TASKS.TASK_NOT_FOUND.type,
          displayMessage: ERRORS.TASKS.TASK_NOT_FOUND.displayMessage
        });
        expect(result.data).toBeNull();
      });
    });
  });
});
