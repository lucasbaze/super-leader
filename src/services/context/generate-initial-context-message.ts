import { stripIndents } from 'common-tags';
import { z } from 'zod';

import { createError } from '@/lib/errors';
import { $system, $user } from '@/lib/llm/messages';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { generateObject } from '@/vendors/ai';

// Response schema
export const ContextMessageSchema = z.object({
  initialQuestion: z.string().describe('The first question to ask the user'),
  followUpQuestions: z
    .array(z.string())
    .describe('A list of 2-3 potential follow-up questions based on context'),
  priority: z
    .number()
    .min(1)
    .max(4)
    .describe('The priority level (1-4) of questions being asked based on completeness'),
  reasoning: z.string().describe('Brief explanation of why these questions were chosen')
});

export type TContextMessage = z.infer<typeof ContextMessageSchema>;

// Define errors
export const ERRORS = {
  GENERATION: {
    FAILED: createError(
      'context_message_generation_failed',
      ErrorType.API_ERROR,
      'Failed to generate context message',
      'Unable to generate questions at this time'
    ),
    INVALID_RESPONSE: createError(
      'invalid_response',
      ErrorType.API_ERROR,
      'Invalid response format from AI service',
      'Unable to process context message at this time'
    )
  }
};

type TGenerateContextMessageParams = {
  completenessScore: number;
  contextSummary: string | null;
};

export async function generateInitialContextMessage({
  completenessScore,
  contextSummary
}: TGenerateContextMessageParams): Promise<ServiceResponse<TContextMessage>> {
  try {
    const messages = [
      $system(buildSystemPrompt().prompt),
      $user(buildUserPrompt({ completenessScore, contextSummary }).prompt)
    ];

    const response = await generateObject({
      messages,
      schema: ContextMessageSchema
    });

    if (!response) {
      return { data: null, error: ERRORS.GENERATION.FAILED };
    }

    const parsedContent = ContextMessageSchema.safeParse(response);

    if (!parsedContent.success) {
      return {
        data: null,
        error: { ...ERRORS.GENERATION.INVALID_RESPONSE, details: parsedContent.error }
      };
    }

    return { data: parsedContent.data, error: null };
  } catch (error) {
    return {
      data: null,
      error: { ...ERRORS.GENERATION.FAILED, details: error }
    };
  }
}

const buildSystemPrompt = () => ({
  prompt: stripIndents`
    You are an expert in building user context through engaging conversation. Your goal is to help gather information about users in a natural, friendly way.

    Completeness Score Guidelines:
    - 0-25%: Focus on basic information (Priority 1) - identity, goals, work, key relationships
    - 26-50%: Explore deeper background (Priority 2) - experiences, decision-making, psychological drivers
    - 51-75%: Investigate preferences (Priority 3) - lifestyle, interests, daily habits
    - 76-100%: Examine long-term vision (Priority 4) - legacy, worldview, philosophical outlook

    Question Guidelines:
    - Be conversational and friendly, not interrogative
    - Ask open-ended questions that encourage reflection
    - Build on existing context when available
    - Vary question types to maintain engagement
    - Focus on one main topic per question
    - Make questions feel natural and flowing from context

    Return your response as a JSON object with:
    - initialQuestion: The first question to ask
    - followUpQuestions: 2-3 potential follow-ups
    - priority: The priority level being addressed (1-4)
    - reasoning: Brief explanation of question selection
  `
});

const buildUserPrompt = ({ completenessScore, contextSummary }: TGenerateContextMessageParams) => ({
  prompt: stripIndents`
    Current User Context:
    - Completeness Score: ${completenessScore}%
    - Existing Context Summary: ${JSON.stringify(contextSummary || { content: 'No context created yet' })}

    Based on the completeness score and existing context, generate an engaging initial question and follow-up questions that will help build a more complete understanding of the user.
  `
});
