import { createError, errorLogger } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

import type { GetTaskSuggestionResult } from './types';

export const ERRORS = {
  TASKS: {
    FETCH_ERROR: createError(
      'tasks_fetch_error',
      ErrorType.DATABASE_ERROR,
      'Error fetching task suggestions',
      'Unable to load your tasks at this time'
    ),
    MISSING_USER_ID: createError(
      'missing_user_id',
      ErrorType.VALIDATION_ERROR,
      'User ID is required',
      'User identifier is missing'
    )
  }
};

export interface GetTasksParams {
  db: DBClient;
  userId: string;
}

export async function getTasks({
  db,
  userId
}: GetTasksParams): Promise<TServiceResponse<GetTaskSuggestionResult[]>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.TASKS.MISSING_USER_ID };
    }

    const { data: tasks, error } = await db
      .from('task_suggestion')
      .select(
        `
        id,
        type,
        content,
        end_at,
        completed_at,
        skipped_at,
        snoozed_at,
        created_at,
        updated_at,
        person:person!inner (
          id,
          first_name,
          last_name
        )
      `
      )
      .eq('user_id', userId)
      .is('completed_at', null)
      .is('skipped_at', null)
      .is('snoozed_at', null)
      .order('end_at', { ascending: true })
      .returns<GetTaskSuggestionResult[]>();

    if (error) {
      const serviceError = ERRORS.TASKS.FETCH_ERROR;
      errorLogger.log(serviceError, { details: error });
      return { data: null, error: serviceError };
    }

    return { data: tasks, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.TASKS.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
