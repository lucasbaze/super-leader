import { dateHandler } from '@/lib/dates/helpers';
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
    ),
    INVALID_DATE_RANGE: createError(
      'invalid_date_range',
      ErrorType.VALIDATION_ERROR,
      'Invalid date range specified',
      'Please provide valid date range parameters'
    )
  }
};

export interface GetTasksParams {
  db: DBClient;
  userId: string;
  personId?: string;
  after?: string; // ISO date string
  before?: string; // ISO date string
}

export type GetTasksQueryResult = TaskSuggestion & {
  person: Pick<Person, 'id' | 'first_name' | 'last_name'>;
};

export async function getTasks({
  db,
  userId,
  personId,
  after,
  before
}: GetTasksParams): Promise<ServiceResponse<GetTaskSuggestionResult[]>> {
  try {
    if (!userId) {
      return { data: null, error: ERRORS.TASKS.MISSING_USER_ID };
    }

    const today = dateHandler();
    const startOfToday = today.startOf('day').toISOString();
    const endOfToday = today.endOf('day').toISOString();

    // Special handling for overdue: if before < today, only return incomplete tasks in the past
    if (before && before < startOfToday) {
      const overdueQuery = db
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
        .gte('end_at', after || '')
        .lt('end_at', startOfToday)
        .order('end_at', { ascending: true });

      if (personId) {
        overdueQuery.eq('person_id', personId);
      }

      const overdueResult = await overdueQuery.returns<GetTasksQueryResult[]>();
      if (overdueResult.error) {
        const serviceError = ERRORS.TASKS.FETCH_ERROR;
        errorLogger.log(serviceError, { details: overdueResult.error });
        return { data: null, error: serviceError };
      }

      const formattedTasks: GetTaskSuggestionResult[] = (overdueResult.data || []).map((task) => ({
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
    }

    // First query for active tasks
    const activeTasksQuery = db
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

    // Second query for completed/skipped tasks from today
    const todayTasksQuery = db
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
      .or(`completed_at.gte.${startOfToday},skipped_at.gte.${startOfToday}`)
      .lte('end_at', endOfToday)
      .order('end_at', { ascending: true });

    // Add person filter if personId is provided
    if (personId) {
      activeTasksQuery.eq('person_id', personId);
      todayTasksQuery.eq('person_id', personId);
    }

    // Add date range filters if provided
    if (after) {
      activeTasksQuery.gte('end_at', after);
    }

    if (before) {
      activeTasksQuery.lte('end_at', before);
    }

    // Execute both queries in parallel
    const [activeTasksResult, todayTasksResult] = await Promise.all([
      activeTasksQuery.returns<GetTasksQueryResult[]>(),
      todayTasksQuery.returns<GetTasksQueryResult[]>()
    ]);

    if (activeTasksResult.error || todayTasksResult.error) {
      const serviceError = ERRORS.TASKS.FETCH_ERROR;
      errorLogger.log(serviceError, {
        details: activeTasksResult.error || todayTasksResult.error
      });
      return { data: null, error: serviceError };
    }

    // Combine and format all tasks
    const allTasks = [...(activeTasksResult.data || []), ...(todayTasksResult.data || [])];
    const uniqueTasks = Array.from(new Map(allTasks.map((task) => [task.id, task])).values());

    // TODO: Fix this garbage
    const formattedTasks: GetTaskSuggestionResult[] = uniqueTasks.map((task) => ({
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
