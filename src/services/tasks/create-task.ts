import { createError, errorLogger } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';

import { buildTaskSuggestion } from './build-task-suggestion';
import { CreateTaskServiceResult, NewTaskParams } from './types';

export const ERRORS = {
  TASKS: {
    CREATE_ERROR: createError(
      'task_create_error',
      ErrorType.DATABASE_ERROR,
      'Error creating task',
      'Unable to create the task at this time'
    ),
    VALIDATION_ERROR: createError(
      'task_validation_error',
      ErrorType.VALIDATION_ERROR,
      'Invalid task data',
      'The task data is not valid'
    ),
    PERSON_NOT_FOUND: createError(
      'person_not_found',
      ErrorType.NOT_FOUND,
      'Person not found',
      'The person associated with this task was not found'
    )
  }
};

export interface CreateTaskParams {
  db: DBClient;
  task: NewTaskParams;
}

export async function createTask({ db, task }: CreateTaskParams): Promise<CreateTaskServiceResult> {
  try {
    console.log('Creating task:', JSON.stringify(task, null, 2));
    // Validate task data
    const buildResult = buildTaskSuggestion({
      userId: task.userId,
      personId: task.personId,
      type: task.type,
      content: task.content,
      endAt: task.endAt
    });

    if (!buildResult.valid || !buildResult.data) {
      return {
        data: null,
        error: buildResult.error || ERRORS.TASKS.VALIDATION_ERROR
      };
    }

    // Verify the person exists
    const { data: person, error: personError } = await db
      .from('person')
      .select('id')
      .eq('id', task.personId)
      .eq('user_id', task.userId)
      .single();

    if (personError || !person) {
      const serviceError = ERRORS.TASKS.PERSON_NOT_FOUND;
      errorLogger.log(serviceError, { details: personError });
      return { data: null, error: serviceError };
    }

    // Insert the task
    const { data: newTask, error: insertError } = await db
      .from('task_suggestion')
      .insert(buildResult.data)
      .select('id')
      .single();

    if (insertError || !newTask) {
      const serviceError = ERRORS.TASKS.CREATE_ERROR;
      errorLogger.log(serviceError, { details: insertError });
      return { data: null, error: serviceError };
    }

    return {
      data: {
        id: newTask.id,
        success: true
      },
      error: null
    };
  } catch (error) {
    const serviceError = {
      ...ERRORS.TASKS.CREATE_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
