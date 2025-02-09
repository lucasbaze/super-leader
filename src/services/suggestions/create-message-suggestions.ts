import { stripIndents } from 'common-tags';

import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { getPerson, GetPersonResult } from '@/services/person/get-person';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';

import { callStructuredOpenAI } from './openai-api';
import { MessageSuggestionsResponseSchema, TMessageSuggestion } from './types';

// Service params interface
interface TCreateMessageSuggestionsParams {
  db: DBClient;
  personId: string;
  contentUrl: string;
  contentTitle: string;
}

// Define errors
export const ERRORS = {
  MESSAGE_SUGGESTIONS: {
    GENERATION_ERROR: createError(
      'message_suggestions_generation_error',
      ErrorType.API_ERROR,
      'Failed to generate message suggestions',
      'Unable to generate message suggestions at this time'
    ),
    PERSON_REQUIRED: createError(
      'person_required',
      ErrorType.VALIDATION_ERROR,
      'Person ID is required',
      'Please provide a person to generate messages for'
    ),
    CONTENT_REQUIRED: createError(
      'content_required',
      ErrorType.VALIDATION_ERROR,
      'Content URL and title are required',
      'Please provide content to share'
    ),
    AI_SERVICE_ERROR: createError(
      'ai_service_error',
      ErrorType.API_ERROR,
      'AI service failed to generate messages',
      'Unable to generate messages at this time'
    )
  }
};

export async function createMessageSuggestions({
  db,
  personId,
  contentUrl,
  contentTitle
}: TCreateMessageSuggestionsParams): Promise<TServiceResponse<TMessageSuggestion[]>> {
  try {
    if (!personId) {
      return { data: null, error: ERRORS.MESSAGE_SUGGESTIONS.PERSON_REQUIRED };
    }

    if (!contentUrl || !contentTitle) {
      return { data: null, error: ERRORS.MESSAGE_SUGGESTIONS.CONTENT_REQUIRED };
    }

    // Get person data
    const personResult = await getPerson({
      db,
      personId,
      withInteractions: true
    });

    if (personResult.error) {
      return { data: null, error: personResult.error };
    }

    const userPrompt = createUserPrompt({
      person: personResult.data,
      contentUrl,
      contentTitle
    });

    try {
      const response = await callStructuredOpenAI({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        schema: MessageSuggestionsResponseSchema,
        options: { temperature: 0.7 }
      });

      return { data: response.suggestions, error: null };
    } catch (error) {
      const serviceError = {
        ...ERRORS.MESSAGE_SUGGESTIONS.GENERATION_ERROR,
        details: error
      };
      errorLogger.log(serviceError);
      return { data: null, error: serviceError };
    }
  } catch (error) {
    const serviceError = {
      ...ERRORS.MESSAGE_SUGGESTIONS.GENERATION_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}

// Helper function to create the prompt
interface TUserPrompt {
  person: GetPersonResult | null;
  contentUrl: string;
  contentTitle: string;
}

const createUserPrompt = ({ person, contentUrl, contentTitle }: TUserPrompt) =>
  stripIndents`
    Person: ${person?.person.first_name}
    Recent Interactions: ${person?.interactions?.map((interaction) => interaction.note).join(', ')}
    Content to Share:
    Title: ${contentTitle}
    URL: ${contentUrl}
  `;

const systemPrompt = stripIndents`
  You are an AI assistant that helps craft personalized messages for sharing content with others. Your goal is to generate natural, contextually appropriate message variations that feel authentic and match the relationship dynamic between the sender and recipient.

  ALWAYS RETURN JSON CONTENT AS DEFINED IN THE OUTPUT FORMAT.

  Guidelines for Message Generation:
  - Adapt the tone based on the relationship context and previous interactions
  - Keep messages concise and conversational
  - Include a natural introduction or context for why you're sharing
  - Maintain authenticity and avoid overly formal or artificial language
  - Consider the recipient's interests and your shared history
  
  Output Format:
  Return 2 message variations in JSON format, structured as follows:

  {
    "suggestions": [
      {
        "text": "Hey! Saw this article and immediately thought of our convo about AI last week. Check it out:",
        "tone": "casual",
      },
      {
        "text": "This is a fascinating piece on [topic] - would love to hear your thoughts when you have a chance to read it",
        "tone": "professional",
      }
    ]
  }

  Additional Notes:
  - Each variation should feel natural and contextually appropriate
  - Include subtle variations in tone and approach
  - Consider the relationship context when determining formality level
  - Incorporate relevant shared experiences or recent interactions when appropriate
`;
