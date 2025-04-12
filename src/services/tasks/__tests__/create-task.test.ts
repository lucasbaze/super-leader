import { SupabaseClient } from '@supabase/supabase-js';

import { dateHandler } from '@/lib/dates/helpers';
import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { createTask, ERRORS } from '../create-task';
import { getTasks } from '../get-tasks';

describe('createTask', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should successfully create a task', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data
        const user = await createTestUser({ db });
        const person = await createTestPerson({
          db,
          data: { user_id: user.id, first_name: 'John', last_name: 'Doe' }
        });

        const taskData = {
          userId: user.id,
          personId: person.id,
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
          endAt: dateHandler().add(1, 'day').toISOString() // Tomorrow
        };

        // Execute the function
        const result = await createTask({
          db,
          task: taskData
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).not.toBeNull();
        expect(result.data?.success).toBe(true);

        // Verify the task was created using getTasks
        const tasksResult = await getTasks({
          db,
          userId: user.id
        });

        expect(tasksResult.error).toBeNull();
        expect(tasksResult.data).toHaveLength(1);

        const createdTask = tasksResult.data![0];
        expect(createdTask.trigger).toBe(TASK_TRIGGERS.BIRTHDAY_REMINDER.slug);
        expect(createdTask.context).toEqual(taskData.context);
        expect(createdTask.suggestedActionType).toBe(SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug);
        expect(createdTask.suggestedAction).toEqual(taskData.suggestedAction);
        expect(dateHandler(createdTask.end_at).isSame(dateHandler(taskData.endAt))).toBe(true);
        expect(createdTask.person.id).toBe(person.id);
        expect(createdTask.person.first_name).toBe('test_John');
        expect(createdTask.person.last_name).toBe('test_Doe');
      });
    });

    it('should create tasks with different action types', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data
        const user = await createTestUser({ db });
        const person = await createTestPerson({
          db,
          data: { user_id: user.id, first_name: 'John', last_name: 'Doe' }
        });

        // Test different action types
        const actionTypes = [
          {
            trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
            context: {
              context: 'Birthday coming up',
              callToAction: 'Send birthday wishes'
            },
            actionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
            action: {
              messageVariants: [
                {
                  tone: 'friendly',
                  message: 'Happy birthday!'
                }
              ]
            }
          },
          {
            trigger: TASK_TRIGGERS.EXTERNAL_NEWS.slug,
            context: {
              context: 'Found relevant article',
              callToAction: 'Share the article'
            },
            actionType: SUGGESTED_ACTION_TYPES.SHARE_CONTENT.slug,
            action: {
              contentVariants: [
                {
                  suggestedContent: {
                    title: 'Article Title',
                    description: 'Article Description',
                    url: 'https://example.com/article'
                  },
                  messageVariants: [
                    {
                      tone: 'professional',
                      message: 'Thought you might find this interesting'
                    }
                  ]
                }
              ]
            }
          },
          {
            trigger: TASK_TRIGGERS.CONTEXT_GATHER.slug,
            context: {
              context: 'Need to gather more information about their interests',
              callToAction: 'Ask about their favorite hobbies'
            },
            actionType: SUGGESTED_ACTION_TYPES.ADD_NOTE.slug,
            action: {
              questionVariants: [
                {
                  type: 'personal',
                  question: 'What are your favorite hobbies?'
                }
              ]
            }
          },
          {
            trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
            context: {
              context: 'Birthday gift needed',
              callToAction: 'Buy a birthday gift'
            },
            actionType: SUGGESTED_ACTION_TYPES.BUY_GIFT.slug,
            action: {
              suggestedGifts: [
                {
                  title: 'Gift Item',
                  reason: 'They would love this',
                  url: 'https://example.com/gift',
                  type: 'nice'
                }
              ]
            }
          }
        ];

        for (const actionConfig of actionTypes) {
          const taskData = {
            userId: user.id,
            personId: person.id,
            trigger: actionConfig.trigger,
            context: actionConfig.context,
            suggestedActionType: actionConfig.actionType,
            suggestedAction: actionConfig.action,
            endAt: dateHandler().add(1, 'day').toISOString()
          };

          // Execute the function
          const result = await createTask({
            db,
            task: taskData
          });

          console.log('result', JSON.stringify(result, null, 2));
          // Verify the result
          expect(result.error).toBeNull();
          expect(result.data).not.toBeNull();
          expect(result.data?.success).toBe(true);
        }

        // Verify all tasks were created
        const { data: tasks } = await db
          .from('task_suggestion')
          .select('*')
          .eq('user_id', user.id)
          .eq('person_id', person.id);

        expect(tasks).toHaveLength(actionTypes.length);

        // Verify each action type exists
        for (const actionConfig of actionTypes) {
          const typeExists = tasks!.some(
            (task) => task.trigger === actionConfig.trigger && task.suggested_action_type === actionConfig.actionType
          );
          expect(typeExists).toBe(true);
        }
      });
    });
  });

  describe('error cases', () => {
    it('should return an error if task validation fails', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Invalid task data (missing required fields)
        const taskData = {
          userId: 'user-id',
          personId: 'person-id',
          trigger: 'invalid-trigger',
          context: {
            // Invalid context structure
            invalid: 'field'
          },
          suggestedActionType: 'invalid-action',
          suggestedAction: {
            invalid: 'action'
          },
          endAt: 'invalid-date'
        };

        // Execute the function
        const result = await createTask({
          db,
          task: taskData as any
        });

        // Verify the error
        expect(result.data).toBeNull();
        expect(result.error).not.toBeNull();
      });
    });

    it('should return an error if the person does not exist', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data
        const user = await createTestUser({ db });
        const nonExistentPersonId = '00000000-0000-0000-0000-000000000000';

        const taskData = {
          userId: user.id,
          personId: nonExistentPersonId,
          trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
          context: {
            context: 'Birthday coming up',
            callToAction: 'Send birthday wishes'
          },
          suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
          suggestedAction: {
            messageVariants: [
              {
                tone: 'friendly',
                message: 'Happy birthday!'
              }
            ]
          },
          endAt: dateHandler().add(1, 'day').toISOString()
        };

        // Execute the function
        const result = await createTask({
          db,
          task: taskData
        });

        // Verify the error
        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.TASKS.PERSON_NOT_FOUND);
      });
    });

    it('should return an error if the person belongs to a different user', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data with two different users
        const user1 = await createTestUser({ db });
        const user2 = await createTestUser({ db });
        const person = await createTestPerson({
          db,
          data: { user_id: user1.id, first_name: 'John', last_name: 'Doe' }
        });

        const taskData = {
          userId: user2.id, // Different user
          personId: person.id,
          trigger: TASK_TRIGGERS.BIRTHDAY_REMINDER.slug,
          context: {
            context: 'Birthday coming up',
            callToAction: 'Send birthday wishes'
          },
          suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
          suggestedAction: {
            messageVariants: [
              {
                tone: 'friendly',
                message: 'Happy birthday!'
              }
            ]
          },
          endAt: dateHandler().add(1, 'day').toISOString()
        };

        // Execute the function
        const result = await createTask({
          db,
          task: taskData
        });

        // Verify the error
        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.TASKS.PERSON_NOT_FOUND);
      });
    });
  });
});
