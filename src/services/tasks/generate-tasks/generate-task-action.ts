import { createError } from '@/lib/errors';
import { SUGGESTED_ACTION_TYPES, SuggestedActionType } from '@/lib/tasks/constants';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { generateObject } from '@/vendors/ai';

import {
  addNoteActionSchema,
  buyGiftActionSchema,
  SendMessageAction,
  sendMessageActionSchema,
  shareContentActionSchema,
  TaskContext
} from '../types';

// Define error types for the service
const ERRORS = {
  INVALID_ACTION_TYPE: createError(
    'InvalidActionType',
    ErrorType.VALIDATION_ERROR,
    'Invalid action type provided',
    'The action type is not supported'
  ),
  GENERATION_FAILED: createError(
    'GenerationFailed',
    ErrorType.INTERNAL_ERROR,
    'Failed to generate action content',
    'We encountered an issue generating the action content'
  )
};

// Define the service parameters
interface GenerateTaskActionParams {
  db: DBClient;
  taskContext: TaskContext & { actionType: SuggestedActionType };
}

// Define the service response type
type GenerateTaskActionResult = ServiceResponse<SendMessageAction | any>;

/**
 * Generates a task action based on the action type
 * This is the central registry for all action generators
 */
export async function generateTaskAction({
  db,
  taskContext
}: GenerateTaskActionParams): Promise<GenerateTaskActionResult> {
  try {
    const { actionType } = taskContext;
    let suggestedAction: any;

    // Generate the appropriate action based on the action type
    switch (actionType) {
      case SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug:
        suggestedAction = await generateSendMessageAction(taskContext);
        break;
      case SUGGESTED_ACTION_TYPES.SHARE_CONTENT.slug:
        suggestedAction = await generateShareContentAction(taskContext);
        break;
      case SUGGESTED_ACTION_TYPES.ADD_NOTE.slug:
        suggestedAction = await generateAddNoteAction(taskContext);
        break;
      case SUGGESTED_ACTION_TYPES.BUY_GIFT.slug:
        suggestedAction = await generateBuyGiftAction(taskContext);
        break;
      default:
        return {
          data: null,
          error: ERRORS.INVALID_ACTION_TYPE
        };
    }

    return {
      data: suggestedAction,
      error: null
    };
  } catch (error) {
    console.error('Error generating task action:', error);
    return {
      data: null,
      error: ERRORS.GENERATION_FAILED
    };
  }
}

/**
 * Generates a send message action
 */
async function generateSendMessageAction(taskContext: TaskContext): Promise<SendMessageAction> {
  const suggestedAction = await generateObject({
    schema: sendMessageActionSchema,
    prompt: `
      Generate the suggested content and message variants based on the context.
      
      Create at least 4 message variants with different tones and styles. Include a mix of casual, formal, and friendly tones. Include at least one ridiculous or funny message such as a poem, joke, or something generally lighthearted.

      Context: ${JSON.stringify(taskContext, null, 2)}
    `
  });

  return suggestedAction;
}

/**
 * Generates a share content action
 */
async function generateShareContentAction(taskContext: TaskContext): Promise<any> {
  const suggestedAction = await generateObject({
    schema: shareContentActionSchema,
    prompt: `
      Generate content suggestions that would be appropriate to share with the person based on the context.
      
      Create at least 3 content variants with different topics and styles. Include a mix of articles, videos, and other content types.

      Context: ${JSON.stringify(taskContext, null, 2)}
    `
  });

  return suggestedAction;
}

/**
 * Generates an add note action
 */
async function generateAddNoteAction(taskContext: TaskContext): Promise<any> {
  const suggestedAction = await generateObject({
    schema: addNoteActionSchema,
    prompt: `
      Generate questions that would help gather more information about the person based on the context.
      
      Create at least 3 question variants that would help improve the relationship with the person.

      Context: ${JSON.stringify(taskContext, null, 2)}
    `
  });

  return suggestedAction;
}

/**
 * Generates a buy gift action
 */
async function generateBuyGiftAction(taskContext: TaskContext): Promise<any> {
  const suggestedAction = await generateObject({
    schema: buyGiftActionSchema,
    prompt: `
      Generate gift suggestions that would be appropriate for the person based on the context.
      
      Create at least 3 gift suggestions with different price points and categories.

      Context: ${JSON.stringify(taskContext, null, 2)}
    `
  });

  return suggestedAction;
}
