import { E } from 'node_modules/@faker-js/faker/dist/airline-D6ksJFwG';

import { dateHandler, getCurrentUtcTime } from '@/lib/dates/helpers';
import { createError } from '@/lib/errors';
import { SUGGESTED_ACTION_TYPES, SuggestedActionType, TASK_TRIGGERS, TaskTrigger } from '@/lib/tasks/constants';
import { TaskSuggestionInsert } from '@/types/database';
import { ErrorType } from '@/types/errors';

import {
  addNoteActionSchema,
  buyGiftActionSchema,
  CreateTaskSuggestion,
  sendMessageActionSchema,
  shareContentActionSchema,
  TaskContext,
  taskContextSchema,
  taskSuggestionSchema
} from './types';

export const ERRORS = {
  TASK_SUGGESTION: {
    INVALID_TRIGGER: createError(
      'invalid_task_trigger',
      ErrorType.VALIDATION_ERROR,
      'Invalid task trigger provided',
      'The task trigger is not valid'
    ),
    INVALID_CONTEXT: createError(
      'invalid_task_context',
      ErrorType.VALIDATION_ERROR,
      'Invalid task context',
      'The task context is not valid'
    ),
    INVALID_ACTION_TYPE: createError(
      'invalid_action_type',
      ErrorType.VALIDATION_ERROR,
      'Invalid suggested action type',
      'The suggested action type is not valid'
    ),
    INVALID_ACTION: createError(
      'invalid_action',
      ErrorType.VALIDATION_ERROR,
      'Invalid suggested action',
      'The suggested action is not valid'
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
    ),
    SCHEMA_VALIDATION_ERROR: createError(
      'schema_validation_error',
      ErrorType.VALIDATION_ERROR,
      'Schema validation error',
      'The task suggestion schema is not valid'
    )
  }
};

export type ValidateTaskSuggestionResult = {
  valid: boolean;
  data: TaskSuggestionInsert | null;
  error: (typeof ERRORS.TASK_SUGGESTION)[keyof typeof ERRORS.TASK_SUGGESTION] | null;
};

export type ValidateTaskSuggestionInput = {
  userId: string;
  personId: string;
  trigger: TaskTrigger;
  context: TaskContext;
  suggestedActionType: SuggestedActionType;
  suggestedAction: CreateTaskSuggestion['suggestedAction'];
  endAt: string;
};

export function isValidTaskTrigger(trigger: TaskTrigger): boolean {
  return Object.values(TASK_TRIGGERS)
    .map((trigger) => trigger.slug)
    .includes(trigger);
}

export function isValidTaskActionType(actionType: SuggestedActionType): boolean {
  return Object.values(SUGGESTED_ACTION_TYPES)
    .map((action) => action.slug)
    .includes(actionType);
}

export function isValidEndAt(endAt: string): boolean {
  return dateHandler(endAt).isAfter(dateHandler(getCurrentUtcTime()));
}

export function validateTaskSuggestion({
  userId,
  personId,
  trigger,
  context,
  suggestedActionType,
  suggestedAction,
  endAt
}: ValidateTaskSuggestionInput): ValidateTaskSuggestionResult {
  // Validate required fields
  if (!userId || !personId || !trigger || !context || !suggestedActionType || !suggestedAction || !endAt) {
    return {
      valid: false,
      data: null,
      error: ERRORS.TASK_SUGGESTION.MISSING_REQUIRED_FIELDS
    };
  }

  // Validate trigger
  if (!isValidTaskTrigger(trigger)) {
    return {
      valid: false,
      data: null,
      error: ERRORS.TASK_SUGGESTION.INVALID_TRIGGER
    };
  }

  // Validate context schema
  try {
    taskContextSchema.parse(context);
  } catch {
    return {
      valid: false,
      data: null,
      error: ERRORS.TASK_SUGGESTION.INVALID_CONTEXT
    };
  }

  // Validate action type
  if (!isValidTaskActionType(suggestedActionType)) {
    return {
      valid: false,
      data: null,
      error: ERRORS.TASK_SUGGESTION.INVALID_ACTION_TYPE
    };
  }

  // Validate action based on type
  try {
    switch (suggestedActionType) {
      case SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug:
        sendMessageActionSchema.parse(suggestedAction);
        break;
      case SUGGESTED_ACTION_TYPES.SHARE_CONTENT.slug:
        shareContentActionSchema.parse(suggestedAction);
        break;
      case SUGGESTED_ACTION_TYPES.ADD_NOTE.slug:
        addNoteActionSchema.parse(suggestedAction);
        break;
      case SUGGESTED_ACTION_TYPES.BUY_GIFT.slug:
        buyGiftActionSchema.parse(suggestedAction);
        break;
      default:
        return {
          valid: false,
          data: null,
          error: ERRORS.TASK_SUGGESTION.INVALID_ACTION_TYPE
        };
    }
  } catch (err) {
    return {
      valid: false,
      data: null,
      error: { ...ERRORS.TASK_SUGGESTION.INVALID_ACTION, details: err }
    };
  }

  // Validate end_at if provided
  if (!isValidEndAt(endAt)) {
    return {
      valid: false,
      data: null,
      error: ERRORS.TASK_SUGGESTION.INVALID_END_DATE
    };
  }

  // Build the task data
  const taskData = {
    userId,
    personId,
    trigger,
    context,
    suggestedActionType,
    suggestedAction,
    endAt
  };

  // Final schema validation
  try {
    taskSuggestionSchema.parse(taskData);

    const formattedData = {
      user_id: userId,
      person_id: personId,
      trigger: taskData.trigger,
      context: taskData.context,
      end_at: taskData.endAt,
      suggested_action_type: taskData.suggestedActionType,
      suggested_action: taskData.suggestedAction
    };

    return {
      valid: true,
      data: formattedData,
      error: null
    };
  } catch (error) {
    console.error('Error building task suggestion:', error);
    return {
      valid: false,
      data: null,
      error: { ...ERRORS.TASK_SUGGESTION.SCHEMA_VALIDATION_ERROR, details: error }
    };
  }
}
