import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { SuggestedActionType, TASK_TRIGGER_SLUGS, TaskTrigger } from '@/lib/tasks/constants';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';

import { getPerson } from '../person/get-person';
import { createTask } from '../tasks/create-task';
import { generateTaskAction } from '../tasks/generate-tasks/generate-task-action';
import { BuildTaskServiceResult } from '../tasks/types';

export const ERRORS = {
  GENERATION: {
    FAILED: createError(
      'generate_tasks_failed',
      ErrorType.API_ERROR,
      'Failed to generate tasks',
      'Unable to generate tasks at this time'
    ),
    MISSING_PERSON_ID: createError(
      'missing_person_id',
      ErrorType.VALIDATION_ERROR,
      'Person ID is required',
      'Person identifier is missing'
    )
  }
};

export interface BuildTaskParams {
  db: DBClient;
  userId: string;
  trigger: TaskTrigger;
  endAt: string;
  personId?: string;
  taskContext: string;
  actionType: SuggestedActionType;
  callToAction: string;
}

export async function buildTask({
  db,
  userId,
  personId,
  trigger,
  endAt,
  taskContext,
  actionType,
  callToAction
}: BuildTaskParams): Promise<BuildTaskServiceResult> {
  try {
    // TODO: Add the ability to build a task for the user if the personId isn't included.

    if (!personId) {
      return { data: null, error: ERRORS.GENERATION.MISSING_PERSON_ID };
    }

    const { data: person, error: personError } = await getPerson({ db, personId });

    if (personError || !person) {
      return { data: null, error: personError };
    }

    const suggestedAction = await generateTaskAction({
      db,
      context: taskContext,
      callToAction,
      actionType
    });

    console.log('AI::GenerateObject::SuggestedAction', JSON.stringify(suggestedAction, null, 2));

    // create the task and insert into the database
    const { data: task, error: taskError } = await createTask({
      db,
      task: {
        userId,
        personId,
        trigger,
        context: {
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
