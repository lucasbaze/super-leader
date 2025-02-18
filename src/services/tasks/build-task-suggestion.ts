import { z } from 'zod';

import { dateHandler, getCurrentUtcTime } from '@/lib/dates/helpers';
import { createError } from '@/lib/errors';
import { TASK_TYPES, TTaskType } from '@/lib/tasks/task-types';
import { ErrorType } from '@/types/errors';

import { taskContentSchema, TTaskContent } from './types';

export const ERRORS = {
  TASK_SUGGESTION: {
    INVALID_TYPE: createError(
      'invalid_task_type',
      ErrorType.VALIDATION_ERROR,
      'Invalid task type provided',
      'The task type is not valid'
    ),
    INVALID_CONTENT: createError(
      'invalid_task_content',
      ErrorType.VALIDATION_ERROR,
      'Invalid task content',
      'The task content is not valid'
    ),
    INVALID_END_DATE: createError(
      'invalid_end_date',
      ErrorType.VALIDATION_ERROR,
      'End date must be in the future',
      'The task end date must be in the future'
    ),
    MISSING_REQUIRED_FIELDS: createError(
      'missing_required_fields',
      ErrorType.VALIDATION_ERROR,
      'Missing required fields',
      'Please provide all required task information'
    )
  }
};

const taskSuggestionSchema = z.object({
  user_id: z.string().min(1),
  person_id: z.string().min(1),
  type: z.enum(Object.values(TASK_TYPES) as [string, ...string[]]),
  content: taskContentSchema,
  end_at: z.string().datetime().optional()
});

export type TTaskSuggestionInput = z.infer<typeof taskSuggestionSchema>;

export type TBuildTaskSuggestionResult = {
  valid: boolean;
  data: (Omit<TTaskSuggestionInput, 'type'> & { type: TTaskType }) | null;
  error: (typeof ERRORS.TASK_SUGGESTION)[keyof typeof ERRORS.TASK_SUGGESTION] | null;
};

export function buildTaskSuggestion({
  userId,
  personId,
  type,
  content,
  endAt
}: {
  userId: string;
  personId: string;
  type: TTaskType;
  content: TTaskContent;
  endAt?: string;
}): TBuildTaskSuggestionResult {
  // Validate required fields
  if (!userId || !personId || !type || !content) {
    return {
      valid: false,
      data: null,
      error: ERRORS.TASK_SUGGESTION.MISSING_REQUIRED_FIELDS
    };
  }

  // Validate task type
  if (!Object.values(TASK_TYPES).includes(type)) {
    return {
      valid: false,
      data: null,
      error: ERRORS.TASK_SUGGESTION.INVALID_TYPE
    };
  }

  // Validate content schema
  try {
    taskContentSchema.parse(content);
  } catch {
    return {
      valid: false,
      data: null,
      error: ERRORS.TASK_SUGGESTION.INVALID_CONTENT
    };
  }

  // Validate end_at if provided
  if (endAt) {
    if (!dateHandler(endAt).isAfter(dateHandler(getCurrentUtcTime()))) {
      return {
        valid: false,
        data: null,
        error: ERRORS.TASK_SUGGESTION.INVALID_END_DATE
      };
    }
  }

  // Final schema validation
  try {
    const taskData = {
      user_id: userId,
      person_id: personId,
      type,
      content,
      end_at: endAt
    };

    taskSuggestionSchema.parse(taskData);

    return {
      valid: true,
      data: taskData,
      error: null
    };
  } catch (error) {
    return {
      valid: false,
      data: null,
      error: ERRORS.TASK_SUGGESTION.MISSING_REQUIRED_FIELDS
    };
  }
}
