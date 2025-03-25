import { createError, errorLogger } from '@/lib/errors';
import { SuggestedActionType, TaskTrigger } from '@/lib/tasks/constants';
import { DBClient, Person, TaskSuggestion } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import type { CreateTaskSuggestion, GetTaskSuggestionResult, TaskContext } from './types';

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
  personId?: string;
}

export type GetTasksQueryResult = TaskSuggestion & {
  person: Pick<Person, 'id' | 'first_name' | 'last_name'>;
};

// TODO: Add additional filters for limit, offset, ordering, etc...
// e.g. getTasks to check for birthday's need to be scoped down within the next 30 days... don't want to miss a birthday from being in the past as a past task.
export async function getTasks({
  db,
  userId,
  personId
}: GetTasksParams): Promise<ServiceResponse<GetTaskSuggestionResult[]>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.TASKS.MISSING_USER_ID };
    }

    const query = db
      .from('task_suggestion')
      .select(
        `
        id,
        trigger,
        context,
        suggested_action_type,
        suggested_action,
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
      .order('end_at', { ascending: true });

    // Add person filter if personId is provided
    if (personId) {
      query.eq('person_id', personId);
    }

    const { data: tasks, error } = await query.returns<GetTasksQueryResult[]>();

    if (error) {
      const serviceError = ERRORS.TASKS.FETCH_ERROR;
      errorLogger.log(serviceError, { details: error });
      return { data: null, error: serviceError };
    }

    const formattedTasks: GetTaskSuggestionResult[] = tasks.map((task) => ({
      ...task,
      trigger: task.trigger as TaskTrigger,
      context: task.context as TaskContext,
      suggestedActionType: task.suggested_action_type as SuggestedActionType,
      suggestedAction: task.suggested_action as CreateTaskSuggestion['suggestedAction'],
      endAt: task.end_at,
      completedAt: task.completed_at,
      skippedAt: task.skipped_at,
      snoozedAt: task.snoozed_at,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }));

    return { data: formattedTasks, error: null };
  } catch (error) {
    const serviceError = {
      ...ERRORS.TASKS.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
