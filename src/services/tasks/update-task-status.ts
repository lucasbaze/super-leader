import { getCurrentUtcTime } from '@/lib/dates/helpers';
import { createError, errorLogger } from '@/lib/errors';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { TaskActionType, TaskUpdateResult } from './types';

export const ERRORS = {
  TASKS: {
    UPDATE_ERROR: createError(
      'task_update_error',
      ErrorType.DATABASE_ERROR,
      'Error updating task status',
      'Unable to update the task at this time'
    ),
    MISSING_REQUIRED_FIELDS: createError(
      'missing_required_fields',
      ErrorType.VALIDATION_ERROR,
      'Missing required fields',
      'Please provide all required information'
    ),
    PERMISSION_DENIED: createError(
      'permission_denied',
      ErrorType.UNAUTHORIZED,
      'Permission denied to update this task',
      'You do not have permission to update this task'
    ),
    NOT_FOUND: createError(
      'task_not_found',
      ErrorType.NOT_FOUND,
      'Task not found',
      'The requested task was not found'
    )
  }
};

export interface UpdateTaskStatusParams {
  db: DBClient;
  userId: string;
  taskId: string;
  action: TaskActionType;
  newEndDate?: string; // Only used for snooze action
}

export async function updateTaskStatus({
  db,
  userId,
  taskId,
  action,
  newEndDate
}: UpdateTaskStatusParams): Promise<ServiceResponse<TaskUpdateResult>> {
  try {
    // Validate required fields
    if (!userId || !taskId || !action) {
      return {
        data: null,
        error: ERRORS.TASKS.MISSING_REQUIRED_FIELDS
      };
    }

    // For snooze action, newEndDate is required
    if (action === TaskActionType.SNOOZE && !newEndDate) {
      return {
        data: null,
        error: {
          ...ERRORS.TASKS.MISSING_REQUIRED_FIELDS,
          message: 'New end date is required for snooze action'
        }
      };
    }

    // First verify the task exists and belongs to the user
    const { data: task, error: fetchError } = await db
      .from('task_suggestion')
      .select('id')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !task) {
      const serviceError = task ? ERRORS.TASKS.PERMISSION_DENIED : ERRORS.TASKS.NOT_FOUND;
      errorLogger.log(serviceError, { details: fetchError });
      return { data: null, error: serviceError };
    }

    // Prepare update data based on action type
    const currentTime = getCurrentUtcTime();
    const updateData: Record<string, any> = { updated_at: currentTime };

    switch (action) {
      case TaskActionType.COMPLETE:
        updateData.completed_at = currentTime;
        break;
      case TaskActionType.SKIP:
        updateData.skipped_at = currentTime;
        break;
      case TaskActionType.SNOOZE:
        updateData.snoozed_at = currentTime;
        updateData.end_at = newEndDate;
        break;
      case TaskActionType.BAD_SUGGESTION:
        updateData.skipped_at = currentTime;
        updateData.bad_suggestion = true; // We'll need to add this column
        break;
      default:
        return {
          data: null,
          error: {
            ...ERRORS.TASKS.MISSING_REQUIRED_FIELDS,
            message: 'Invalid action type'
          }
        };
    }

    // Update the task
    const { error: updateError } = await db
      .from('task_suggestion')
      .update(updateData)
      .eq('id', taskId)
      .eq('user_id', userId);

    if (updateError) {
      const serviceError = ERRORS.TASKS.UPDATE_ERROR;
      errorLogger.log(serviceError, { details: updateError });
      return { data: null, error: serviceError };
    }

    return {
      data: {
        id: taskId,
        success: true
      },
      error: null
    };
  } catch (error) {
    const serviceError = {
      ...ERRORS.TASKS.UPDATE_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
