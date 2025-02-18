import { SupabaseClient } from '@supabase/supabase-js';
import { addDays } from 'date-fns';

import { TASK_TYPES } from '@/lib/tasks/task-types';
import { createTestPerson, createTestTask, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { buildTaskSuggestion } from '../build-task-suggestion';
import { ERRORS, getTasks } from '../get-tasks';
import { taskContentSchema } from '../types';

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

        const taskContent = {
          action: 'Send birthday wishes',
          context: 'Birthday coming up',
          suggestion: 'Send a thoughtful message'
        };

        const taskBuild = buildTaskSuggestion({
          userId: testUser.id,
          personId: testPerson.id,
          type: TASK_TYPES.BIRTHDAY_REMINDER,
          content: taskContent,
          endAt: addDays(new Date(), 1).toISOString()
        });

        expect(taskBuild.valid).toBe(true);
        expect(taskBuild.error).toBeNull();

        const testTask = await createTestTask({
          db,
          data: taskBuild.data!
        });

        const result = await getTasks({ db, userId: testUser.id });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toMatchObject({
          id: testTask.id,
          type: TASK_TYPES.BIRTHDAY_REMINDER,
          content: taskContent,
          person: {
            id: testPerson.id,
            first_name: 'test_John',
            last_name: 'test_Doe'
          }
        });

        // Validate task content schema
        expect(() => taskContentSchema.parse(result.data![0].content)).not.toThrow();
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

        const taskBuild = buildTaskSuggestion({
          userId: testUser.id,
          personId: testPerson.id,
          type: TASK_TYPES.PROFILE_UPDATE,
          content: {
            action: 'Update profile',
            context: 'Missing information',
            suggestion: 'Add more details'
          }
        });

        expect(taskBuild.valid).toBe(true);
        expect(taskBuild.error).toBeNull();

        // Create active task
        await createTestTask({
          db,
          data: taskBuild.data!
        });

        // Mark task as completed
        await db
          .from('task_suggestion')
          .update({ completed_at: new Date().toISOString() })
          .eq('user_id', testUser.id);

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

        const taskContent = {
          action: 'Follow up',
          context: 'Recent meeting',
          suggestion: 'Schedule next meeting'
        };

        // Create task for first user
        const taskBuild1 = buildTaskSuggestion({
          userId: testUser1.id,
          personId: testPerson1.id,
          type: TASK_TYPES.SUGGESTED_REMINDER,
          content: taskContent
        });

        expect(taskBuild1.valid).toBe(true);
        await createTestTask({
          db,
          data: taskBuild1.data!
        });

        // Create task for second user
        const taskBuild2 = buildTaskSuggestion({
          userId: testUser2.id,
          personId: testPerson2.id,
          type: TASK_TYPES.SUGGESTED_REMINDER,
          content: taskContent
        });

        expect(taskBuild2.valid).toBe(true);
        await createTestTask({
          db,
          data: taskBuild2.data!
        });

        const result = await getTasks({ db, userId: testUser1.id });

        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(1);
        expect(result.data![0].person).toMatchObject({
          first_name: 'test_John',
          last_name: 'test_Doe'
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
