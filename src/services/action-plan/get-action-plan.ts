import { dateHandler } from '@/lib/dates/helpers';
import { createError, errorLogger } from '@/lib/errors';
import { getTask } from '@/services/tasks/get-task';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';
import { ActionPlan, DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { ActionPlanWithTaskIds, GenerateActionPlan } from './schema';

export const ERRORS = {
  ACTION_PLAN: {
    FETCH_ERROR: createError(
      'action_plan_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching action plan data',
      'Unable to load your action plan at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    ),
    NOT_FOUND: createError(
      'action_plan_not_found',
      ErrorType.NOT_FOUND,
      'Action plan not found for today',
      'No action plan found for today'
    )
  }
};

export interface GetActionPlanParams {
  db: DBClient;
  userId: string;
}

export interface GetActionPlanServiceResult {
  actionPlan: ActionPlanWithTaskIds;
  tasks: GetTaskSuggestionResult[];
}

export async function getActionPlan({
  db,
  userId
}: GetActionPlanParams): Promise<ServiceResponse<GetActionPlanServiceResult>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.ACTION_PLAN.MISSING_USER_ID };
    }

    // Get today's date in user's timezone
    const today = dateHandler();
    const startOfDay = today.startOf('day').toISOString();
    const endOfDay = today.endOf('day').toISOString();

    // Fetch the action plan for today
    const { data: actionPlanData, error } = await db
      .from('action_plan')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .eq('state', 'injected') // Only get completed action plans with task IDs
      .order('created_at', { ascending: false })
      .limit(1)
      .single<ActionPlan>();

    if (error) {
      const serviceError = ERRORS.ACTION_PLAN.FETCH_ERROR;
      errorLogger.log(serviceError, { details: error });
      return { data: null, error: serviceError };
    }

    if (!actionPlanData) {
      return { data: null, error: ERRORS.ACTION_PLAN.NOT_FOUND };
    }

    // Parse the action plan JSON
    const actionPlan = actionPlanData.action_plan as ActionPlanWithTaskIds;

    // Extract all task IDs from the action plan
    const taskIds: string[] = [];
    actionPlan.groupSections.forEach((section) => {
      section.tasks.forEach((task) => {
        if (task.id) {
          taskIds.push(task.id);
        }
      });
    });

    // Fetch all tasks in parallel
    const taskPromises = taskIds.map((taskId) => getTask({ db, taskId }));
    const taskResults = await Promise.all(taskPromises);

    // Filter out failed fetches and extract successful data
    const tasks = taskResults
      .filter((result) => result.data && !result.error) // Only include successful fetches
      .map((result) => result.data!);

    return {
      data: {
        actionPlan,
        tasks
      },
      error: null
    };
  } catch (error) {
    const serviceError = {
      ...ERRORS.ACTION_PLAN.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
