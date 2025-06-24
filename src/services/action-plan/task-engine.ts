import { createError, errorLogger, toError } from '@/lib/errors';
import { buildTask } from '@/services/tasks/build-task';
import { ActionPlan, DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { generateActionPlan } from './generators/generate-action-plan';
import { ActionPlanTask, GenerateActionPlan } from './schema';

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
    const generatedActionPlan = await generateActionPlan({ db, userId });

    // Add the id property to the tasks as pre-processing
    // const groupSections = generatedActionPlan.groupSections;
    // groupSections.forEach(section => {
    //   section.tasks.forEach(task => {
    //     task.id = null;
    //   });
    // });

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
    const buildTasksResult = await Promise.all(
      taskData.map((task) =>
        buildTask({
          db,
          userId,
          personId: task.personId,
          trigger: task.taskType,
          endAt: task.taskDueDate,
          context: task.taskContext
        })
      )
    );

    const taskIdMap = new Map();
    buildTasksResult.forEach((result, idx) => {
      if (result.data) {
        taskIdMap.set(`${result.data.task.person_id}-${taskData[idx].taskType}`, result.data.task.id);
      }
    });

    // Deep clone to avoid mutating the original
    const updatedActionPlan = JSON.parse(JSON.stringify(rawActionPlan)) as GenerateActionPlan;
    updatedActionPlan.groupSections.forEach((section) => {
      section.tasks.forEach((task) => {
        const key = `${task.personId}-${task.taskType}`;
        if (taskIdMap.has(key)) {
          task = {
            ...task,
            // @ts-ignore
            taskId: taskIdMap.get(key)
          };
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
