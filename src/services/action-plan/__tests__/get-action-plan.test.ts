import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson, createTestUser } from '@/tests/test-builder';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { ERRORS, getActionPlan } from '../get-action-plan';
import { ActionPlanWithTaskIds, GenerateActionPlan } from '../schema';

describe('get-action-plan-service', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('getActionPlan', () => {
    describe('success cases', () => {
      it.only('should return action plan with tasks for today', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          // Create test person
          const testPerson = await createTestPerson({
            db,
            data: {
              user_id: testUser.id,
              first_name: 'John',
              last_name: 'Doe'
            }
          });

          // Create a task suggestion that matches the task ID in the action plan
          const { data: taskSuggestionData } = await db
            .from('task_suggestion')
            .insert({
              user_id: testUser.id,
              person_id: testPerson.id,
              trigger: 'action_plan',
              context: { message: 'Follow up context' },
              suggested_action_type: 'follow_up',
              suggested_action: { message: 'Follow up action' },
              end_at: new Date().toISOString()
            })
            .select()
            .single();

          // Create a mock action plan
          const mockActionPlan: ActionPlanWithTaskIds = {
            buildDate: new Date().toISOString(),
            executiveSummary: {
              title: 'Test Action Plan',
              description: 'Test description',
              content: 'Test content'
            },
            groupSections: [
              {
                title: 'Follow Ups',
                icon: 'message-circle',
                description: 'People to follow up with',
                tasks: [
                  {
                    id: taskSuggestionData?.id,
                    personId: testPerson.id,
                    personName: 'John Doe',
                    taskContext: 'Follow up on previous conversation',
                    taskType: 'follow_up' as any,
                    callToAction: 'Send a follow-up message',
                    taskDueDate: new Date().toISOString()
                  }
                ]
              }
            ],
            quote: 'Test quote'
          };

          // Insert action plan into database
          const { data: actionPlanData } = await db
            .from('action_plan')
            .insert({
              action_plan: mockActionPlan,
              state: 'injected',
              user_id: testUser.id
            })
            .select()
            .single();

          const result = await getActionPlan({
            db,
            userId: testUser.id
          });

          expect(result.error).toBeNull();
          expect(result.data).toBeDefined();
          expect(result.data?.actionPlan).toEqual(mockActionPlan);
          expect(result.data?.tasks).toHaveLength(1);
          expect(result.data?.tasks[0].id).toBe(taskSuggestionData.id);
          expect(result.data?.tasks[0].person.id).toBe(testPerson.id);
        });
      });

      it('should return error when no action plan exists for today', async () => {
        await withTestTransaction(supabase, async (db) => {
          const testUser = await createTestUser({ db });

          const result = await getActionPlan({
            db,
            userId: testUser.id
          });

          expect(result.data).toBeNull();
          expect(result.error).toBeDefined();
          expect(result.error).toEqual(ERRORS.ACTION_PLAN.NOT_FOUND);
        });
      });
    });

    describe('error cases', () => {
      it('should return error when userId is missing', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await getActionPlan({
            db,
            userId: ''
          });

          expect(result.data).toBeNull();
          expect(result.error).toBeDefined();
          expect(result.error).toEqual(ERRORS.ACTION_PLAN.MISSING_USER_ID);
        });
      });
    });
  });
});
