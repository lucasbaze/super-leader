import { SupabaseClient } from '@supabase/supabase-js';

import { dateHandler } from '@/lib/dates/helpers';
import { createTestPerson, createTestTaskSuggestion, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { TaskActionType } from '../types';
import { ERRORS, updateTaskStatus } from '../update-task-status';

describe('updateTaskStatus', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('success cases', () => {
    it('should mark a task as completed', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data
        const user = await createTestUser({ db });
        const person = await createTestPerson({
          db,
          data: { user_id: user.id, first_name: 'John', last_name: 'Doe' }
        });
        const task = await createTestTaskSuggestion(db, {
          userId: user.id,
          personId: person.id
        });

        // Execute the function
        const result = await updateTaskStatus({
          db,
          userId: user.id,
          taskId: task.id,
          action: TaskActionType.COMPLETE
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          id: task.id,
          success: true
        });

        // Verify the task was updated in the database
        const { data: updatedTask } = await db
          .from('task_suggestion')
          .select('*')
          .eq('id', task.id)
          .single();

        expect(updatedTask).not.toBeNull();
        expect(updatedTask!.completed_at).not.toBeNull();
      });
    });

    it('should mark a task as skipped', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data
        const user = await createTestUser({ db });
        const person = await createTestPerson({
          db,
          data: { user_id: user.id, first_name: 'John', last_name: 'Doe' }
        });
        const task = await createTestTaskSuggestion(db, { userId: user.id, personId: person.id });

        // Execute the function
        const result = await updateTaskStatus({
          db,
          userId: user.id,
          taskId: task.id,
          action: TaskActionType.SKIP
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          id: task.id,
          success: true
        });

        // Verify the task was updated in the database
        const { data: updatedTask } = await db
          .from('task_suggestion')
          .select('*')
          .eq('id', task.id)
          .single();

        expect(updatedTask).not.toBeNull();
        expect(updatedTask!.skipped_at).not.toBeNull();
      });
    });

    it('should snooze a task with a new end date', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data
        const user = await createTestUser({ db });
        const person = await createTestPerson({
          db,
          data: { user_id: user.id, first_name: 'John', last_name: 'Doe' }
        });
        const task = await createTestTaskSuggestion(db, { userId: user.id, personId: person.id });

        const newEndDate = dateHandler().add(3, 'days').toISOString();

        // Execute the function
        const result = await updateTaskStatus({
          db,
          userId: user.id,
          taskId: task.id,
          action: TaskActionType.SNOOZE,
          newEndDate
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          id: task.id,
          success: true
        });

        // Verify the task was updated in the database
        const { data: updatedTask } = await db
          .from('task_suggestion')
          .select('*')
          .eq('id', task.id)
          .single();

        expect(updatedTask).not.toBeNull();
        expect(updatedTask!.snoozed_at).not.toBeNull();
        expect(dateHandler(updatedTask!.end_at).isSame(dateHandler(newEndDate))).toBe(true);
      });
    });

    it('should mark a task as a bad suggestion', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data
        const user = await createTestUser({ db });
        const person = await createTestPerson({
          db,
          data: { user_id: user.id, first_name: 'John', last_name: 'Doe' }
        });
        const task = await createTestTaskSuggestion(db, { userId: user.id, personId: person.id });

        // Execute the function
        const result = await updateTaskStatus({
          db,
          userId: user.id,
          taskId: task.id,
          action: TaskActionType.BAD_SUGGESTION
        });

        // Verify the result
        expect(result.error).toBeNull();
        expect(result.data).toEqual({
          id: task.id,
          success: true
        });

        // Verify the task was updated in the database
        const { data: updatedTask } = await db
          .from('task_suggestion')
          .select('*')
          .eq('id', task.id)
          .single();

        expect(updatedTask).not.toBeNull();
        expect(updatedTask!.skipped_at).not.toBeNull();
        expect(updatedTask!.bad_suggestion).toBe(true);
      });
    });
  });

  describe('error cases', () => {
    it('should return an error if required fields are missing', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await updateTaskStatus({
          db,
          userId: '',
          taskId: '123',
          action: TaskActionType.COMPLETE
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.TASKS.MISSING_REQUIRED_FIELDS);
      });
    });

    it('should return an error if new end date is missing for snooze action', async () => {
      await withTestTransaction(supabase, async (db) => {
        const result = await updateTaskStatus({
          db,
          userId: '123',
          taskId: '456',
          action: TaskActionType.SNOOZE
        });

        expect(result.data).toBeNull();
        expect(result.error?.message).toBe('New end date is required for snooze action');
      });
    });

    it('should return an error if task is not found', async () => {
      await withTestTransaction(supabase, async (db) => {
        const user = await createTestUser({ db });

        const result = await updateTaskStatus({
          db,
          userId: user.id,
          taskId: 'non-existent-id',
          action: TaskActionType.COMPLETE
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.TASKS.NOT_FOUND);
      });
    });

    it('should return an error if user does not own the task', async () => {
      await withTestTransaction(supabase, async (db) => {
        // Setup test data with two different users
        const user1 = await createTestUser({ db });
        const user2 = await createTestUser({ db });
        const person = await createTestPerson({
          db,
          data: { user_id: user1.id, first_name: 'John', last_name: 'Doe' }
        });
        const task = await createTestTaskSuggestion(db, { userId: user1.id, personId: person.id });

        // Try to update the task with user2
        const result = await updateTaskStatus({
          db,
          userId: user2.id,
          taskId: task.id,
          action: TaskActionType.COMPLETE
        });

        expect(result.data).toBeNull();
        expect(result.error).toMatchObject(ERRORS.TASKS.NOT_FOUND);
      });
    });
  });
});
