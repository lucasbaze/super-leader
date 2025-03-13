import { SupabaseClient } from '@supabase/supabase-js';

import { dateHandler } from '@/lib/dates/helpers';
import { TASK_TYPES } from '@/lib/tasks/task-types';
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
          type: TASK_TYPES.REQUESTED_REMINDER,
          content: {
            action: 'Follow up call',
            context: 'Discuss project progress',
            suggestion: 'Schedule a call to review current project status'
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
        expect(createdTask.type).toBe(TASK_TYPES.REQUESTED_REMINDER);
        expect(createdTask.content).toEqual(taskData.content);
        expect(dateHandler(createdTask.end_at).isSame(dateHandler(taskData.endAt))).toBe(true);
        expect(createdTask.person.id).toBe(person.id);
        expect(createdTask.person.first_name).toBe('test_John');
        expect(createdTask.person.last_name).toBe('test_Doe');
      });
    });

    it('should create tasks with different types', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data
        const user = await createTestUser({ db });
        const person = await createTestPerson({
          db,
          data: { user_id: user.id, first_name: 'John', last_name: 'Doe' }
        });

        // Test with different task types
        for (const type of Object.values(TASK_TYPES)) {
          const taskData = {
            userId: user.id,
            personId: person.id,
            type,
            content: {
              action: `Test ${type}`,
              context: `Context for ${type}`,
              suggestion: `Suggestion for ${type}`
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
        }

        // Verify all task types were created
        const { data: tasks } = await db
          .from('task_suggestion')
          .select('*')
          .eq('user_id', user.id)
          .eq('person_id', person.id);

        expect(tasks).toHaveLength(Object.values(TASK_TYPES).length);

        // Verify each task type exists
        for (const type of Object.values(TASK_TYPES)) {
          const typeExists = tasks!.some((task) => task.type === type);
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
          type: TASK_TYPES.SUGGESTED_REMINDER,
          content: {
            // Missing required fields
            action: '',
            context: '',
            suggestion: ''
          },
          endAt: 'invalid-date'
        };

        // Execute the function
        const result = await createTask({
          db,
          task: taskData
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
          type: TASK_TYPES.SUGGESTED_REMINDER,
          content: {
            action: 'Follow up call',
            context: 'Discuss project progress',
            suggestion: 'Schedule a call to review current project status'
          },
          endAt: dateHandler().add(1, 'day').toISOString() // Tomorrow
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
          type: TASK_TYPES.SUGGESTED_REMINDER,
          content: {
            action: 'Follow up call',
            context: 'Discuss project progress',
            suggestion: 'Schedule a call to review current project status'
          },
          endAt: dateHandler().add(1, 'day').toISOString() // Tomorrow
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
