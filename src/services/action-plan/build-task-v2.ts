import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { SuggestedActionType, TASK_TRIGGER_SLUGS, TaskTrigger } from '@/lib/tasks/constants';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';

import { getPerson } from '../person/get-person';
import { formatAiSummaryOfPersonToDisplay } from '../summary/format-ai-summary';
import { createTask } from '../tasks/create-task';
import { generateContextAndActionType } from '../tasks/generate-tasks/generate-context-and-action-type';
import { generateTaskAction } from '../tasks/generate-tasks/generate-task-action';
import { BuildTaskServiceResult } from '../tasks/types';
import { isValidEndAt, isValidTaskTrigger } from '../tasks/validate-task-suggestion';

// Define errors
export const ERRORS = {
  GENERATION: {
    FAILED: createError(
      'generate_tasks_failed',
      ErrorType.API_ERROR,
      'Failed to generate tasks',
      'Unable to generate tasks at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    ),
    MISSING_PERSON_ID: createError(
      'missing_person_id',
      ErrorType.VALIDATION_ERROR,
      'Person ID is required',
      'Person identifier is missing'
    ),
    INVALID_TRIGGER: createError(
      'invalid_trigger',
      ErrorType.VALIDATION_ERROR,
      'Trigger is invalid',
      'Trigger is invalid'
    ),
    INVALID_END_AT: createError('invalid_end_at', ErrorType.VALIDATION_ERROR, 'End at is invalid', 'End at is invalid')
  }
};

// Service params interface
export interface BuildTaskParams {
  db: DBClient;
  userId: string;
  endAt: string;
  personId?: string;
  taskContext: string;
  actionType: SuggestedActionType;
  callToAction: string;
}

// function validateBuildTaskParams({ trigger, endAt, userId }: Pick<BuildTaskParams, 'trigger' | 'endAt' | 'userId'>) {
//   // We should validate the inputs here before we even call the LLM
//   const validTrigger = isValidTaskTrigger(trigger);
//   const validEndAt = isValidEndAt(endAt);

//   if (!validTrigger) {
//     return { data: null, error: ERRORS.GENERATION.INVALID_TRIGGER };
//   }

//   if (!validEndAt) {
//     return { data: null, error: ERRORS.GENERATION.INVALID_END_AT };
//   }

//   if (!userId) {
//     return { data: null, error: ERRORS.GENERATION.MISSING_USER_ID };
//   }

//   return { data: null, error: null };
// }

export async function buildTask({
  db,
  userId,
  personId,
  // trigger,
  endAt,
  taskContext,
  actionType,
  callToAction
}: BuildTaskParams): Promise<BuildTaskServiceResult> {
  try {
    // TODO: Add better validation checks here... Too verbose

    // const validationResult = validateBuildTaskParams({ trigger, endAt, userId });

    // if (validationResult.error) {
    //   return { data: null, error: validationResult.error };
    // }

    // TODO: Get the user
    if (!personId) {
      // Assume the task is for the user
      return { data: null, error: ERRORS.GENERATION.MISSING_PERSON_ID };
    }

    const { data: person, error: personError } = await getPerson({ db, personId });

    if (personError || !person) {
      return { data: null, error: personError };
    }

    // Select the context and action type
    // const taskContextAndActionType = await generateContextAndActionType({
    //   person: person.person,
    //   trigger,
    //   taskContext: context,
    //   personContext: formatAiSummaryOfPersonToDisplay(person.person.ai_summary)
    // });

    // console.log('AI::GenerateObject::TaskContextAndActionType', taskContextAndActionType);

    const suggestedAction = await generateTaskAction({
      db,
      taskContext: {
        context: taskContext,
        callToAction,
        actionType
      }
    });

    console.log('AI::GenerateObject::SuggestedAction', suggestedAction);

    // create the task and insert into the database
    const { data: task, error: taskError } = await createTask({
      db,
      task: {
        userId,
        personId,
        // TODO: Fix this
        trigger: TASK_TRIGGER_SLUGS.FOLLOW_UP,
        context: {
          // TODO: rename this
          context: taskContext,
          callToAction
        },
        suggestedActionType: actionType,
        suggestedAction: suggestedAction.data,
        endAt
      }
    });

    if (taskError) {
      return { data: null, error: taskError };
    }

    console.log('AI::CreateTask::Task', task);

    return {
      data: task,
      error: null
    };
  } catch (error) {
    const serviceError = {
      ...ERRORS.GENERATION.FAILED,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
