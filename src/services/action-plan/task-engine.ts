import { createError, errorLogger, toError } from '@/lib/errors';
import { buildTask } from '@/services/tasks/build-task';
import { ActionPlan, DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { generateActionPlan } from './generators/generate-action-plan';
import { ActionPlanTask } from './schema';

const ERRORS = {
  GENERATING_ACTION_PLAN_FAILED: createError(
    'generating_action_plan_failed',
    ErrorType.API_ERROR,
    'Failed to generate action plan',
    'Unable to generate action plan at this time'
  ),
  SAVING_ACTION_PLAN_FAILED: createError(
    'saving_action_plan_failed',
    ErrorType.API_ERROR,
    'Failed to save action plan',
    'Unable to save action plan at this time'
  )
};

export const buildActionPlan = async (db: DBClient, userId: string): Promise<ServiceResponse<ActionPlan>> => {
  try {
    // Generate the action plan
    const actionPlan = await generateActionPlan({ db, userId });

    // Save the action plan in it's base state
    const { data: actionPlanData, error: actionPlanError } = await db.from('action_plan').insert({
      action_plan: actionPlan,
      state: 'raw',
      user_id: userId
    });

    if (actionPlanError) {
      return {
        data: null,
        error: { ...ERRORS.SAVING_ACTION_PLAN_FAILED, details: actionPlanError }
      };
    }

    // Generate and save the tasks associated with the action plan
    const taskData = actionPlan.groupSections.flatMap((section) => {
      const tasks: ActionPlanTask[] = [];
      section.tasks.forEach((task) => {
        tasks.push(task);
      });
      return tasks;
    });

    const taskPromises = taskData.map((task) => {
      return buildTask({
        db,
        userId,
        personId: task.personId,
        trigger: task.taskType,
        endAt: task.taskDueDate,
        context: task.taskContext
      });
    });

    const buildTasksResult = await Promise.all(taskPromises);

    return {
      data: actionPlanData,
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.GENERATING_ACTION_PLAN_FAILED, { details: error });
    return {
      data: null,
      error: { ...ERRORS.GENERATING_ACTION_PLAN_FAILED, details: toError(error) }
    };
  }

  // Re-inject the tasks into the action plan

  // Re-save the action plan with the tasks injected
};
