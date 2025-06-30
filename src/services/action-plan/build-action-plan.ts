import fs from 'fs';

import { createError, errorLogger, toError } from '@/lib/errors';
import { SuggestedActionType } from '@/lib/tasks/constants';
import { buildTask } from '@/services/tasks/build-task';
import { ActionPlan, DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { generateActionPlan } from './generators/generate-action-plan';
import { ActionPlanWithTaskIds, GenerateActionPlan } from './schema';

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

interface BuildActionPlanParams {
  db: DBClient;
  userId: string;
}

export const buildActionPlan = async ({
  db,
  userId
}: BuildActionPlanParams): Promise<ServiceResponse<ActionPlan | any>> => {
  try {
    // Generate the action plan
    // const generatedActionPlan = await generateActionPlan({ db, userId });
    const generatedActionPlan = JSON.parse(fs.readFileSync('src/services/action-plan/raw-action-plan.json', 'utf8'));

    // Save the action plan in it's base state
    const { data: actionPlanData, error: actionPlanError } = await db
      .from('action_plan')
      .insert({
        action_plan: generatedActionPlan,
        state: 'raw',
        user_id: userId
      })
      .select()
      .single<ActionPlan>();

    if (actionPlanError) {
      return {
        data: null,
        error: { ...ERRORS.SAVING_ACTION_PLAN_FAILED, details: actionPlanError }
      };
    }

    const rawActionPlan = actionPlanData.action_plan as GenerateActionPlan;
    const groupSections = rawActionPlan?.groupSections;

    // Generate and save the tasks associated with the action plan
    const taskData = groupSections.flatMap((section) => section.tasks);

    console.log('About to build', taskData.length, 'tasks');
    console.log('First task data:', JSON.stringify(taskData[0], null, 2));

    const buildTasksResult = await Promise.all(
      taskData.map(async (task, index) => {
        console.log(`Building task ${index + 1}/${taskData.length} for person ${task.personId}`);
        try {
          const result = await buildTask({
            db,
            userId,
            personId: task.personId,
            endAt: task.taskDueDate,
            trigger: task.taskTrigger,
            taskContext: task.taskContext,
            callToAction: task.callToAction,
            actionType: task.taskType as SuggestedActionType
          });
          console.log(`Task ${index + 1} result:`, result.error ? 'ERROR' : 'SUCCESS', result);
          return result;
        } catch (error) {
          console.error(`Task ${index + 1} threw error:`, error);
          return { data: null, error: toError(error) };
        }
      })
    );

    console.log(
      'All build results:',
      buildTasksResult.map((r, i) => `${i}: ${r.error ? 'ERROR' : 'SUCCESS'}`)
    );

    const taskIdMap = new Map();
    buildTasksResult.forEach((result, idx) => {
      if (result.data) {
        taskIdMap.set(result.data.task.person_id, result.data.task.id);
      } else {
        console.error(`Task ${idx} failed:`, result.error);
      }
    });

    // Deep clone to avoid mutating the original
    const updatedActionPlan = JSON.parse(JSON.stringify(rawActionPlan)) as ActionPlanWithTaskIds;
    updatedActionPlan.groupSections.forEach((section) => {
      section.tasks.forEach((task) => {
        if (taskIdMap.has(task.personId)) {
          task.id = taskIdMap.get(task.personId);
        }
      });
    });

    // 5. Update the action plan row with the injected task IDs
    const { error: updateError } = await db
      .from('action_plan')
      .update({ action_plan: updatedActionPlan, state: 'injected' })
      .eq('id', actionPlanData.id);

    if (updateError) {
      return {
        data: null,
        error: { ...ERRORS.SAVING_ACTION_PLAN_FAILED, details: updateError }
      };
    }

    return {
      data: generatedActionPlan,
      error: null
    };
  } catch (error) {
    errorLogger.log(ERRORS.GENERATING_ACTION_PLAN_FAILED, { details: error });
    return {
      data: null,
      error: { ...ERRORS.GENERATING_ACTION_PLAN_FAILED, details: toError(error) }
    };
  }
};
