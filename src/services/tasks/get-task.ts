import { createError, errorLogger } from '@/lib/errors';
import { SuggestedActionType, TaskTrigger } from '@/lib/tasks/constants';
import { DBClient, Person, TaskSuggestion } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import type { CreateTaskSuggestion, GetTaskSuggestionResult, TaskContext } from './types';

export const ERRORS = {
  TASKS: {
    FETCH_ERROR: createError(
      'task_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching task suggestion',
      'Unable to load your task at this time'
    ),
    MISSING_TASK_ID: createError(
      'missing_task_id',
      ErrorType.VALIDATION_ERROR,
      'Task ID is required',
      'Task identifier is missing'
    ),
    TASK_NOT_FOUND: createError(
      'task_not_found',
      ErrorType.NOT_FOUND,
      'Task not found',
      'The requested task could not be found'
    )
  }
};

export interface GetTaskParams {
  db: DBClient;
  taskId: string;
}

export type GetTaskQueryResult = TaskSuggestion & {
  person: Pick<Person, 'id' | 'first_name' | 'last_name'>;
};

export async function getTask({ db, taskId }: GetTaskParams): Promise<ServiceResponse<GetTaskSuggestionResult>> {
  try {
    if (!taskId) {
      return { data: null, error: ERRORS.TASKS.MISSING_TASK_ID };
    }

    const result = await db
      .from('task_suggestion')
      .select(
        `
        *,
        person:person!inner (
          id,
          first_name,
          last_name
        )
      `
      )
      .eq('id', taskId)
      .single<GetTaskQueryResult>();

    if (!result.data) {
      return { data: null, error: ERRORS.TASKS.TASK_NOT_FOUND };
    }

    console.log('result', result.data);

    const formattedTask: GetTaskSuggestionResult = {
      id: result.data.id,
      trigger: result.data.trigger as TaskTrigger,
      context: result.data.context as TaskContext,
      suggestedActionType: result.data.suggested_action_type as SuggestedActionType,
      suggestedAction: result.data.suggested_action as CreateTaskSuggestion['suggestedAction'],
      endAt: result.data.end_at,
      completedAt: result.data.completed_at,
      skippedAt: result.data.skipped_at,
      snoozedAt: result.data.snoozed_at,
      createdAt: result.data.created_at,
      updatedAt: result.data.updated_at,
      person: {
        id: result.data.person.id,
        firstName: result.data.person.first_name,
        lastName: result.data.person.last_name
      }
    };

    return { data: formattedTask, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.TASKS.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
