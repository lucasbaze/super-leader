import { stripIndents } from 'common-tags';
import { zodResponseFormat } from 'openai/helpers/zod';

import { createError } from '@/lib/errors';
import { $system, $user } from '@/lib/llm/messages';
import { wrapTicks } from '@/lib/utils/strings';
import { GetPersonResult } from '@/services/person/get-person';
import { Suggestion } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';
import { chatCompletion, type ChatCompletionOptions } from '@/vendors/open-router';

import {
  SuggestionPromptResponseSchema,
  SuggestionSchema,
  TSuggestionPromptResponse
} from './types';

// Define errors
export const ERRORS = {
  PROMPT_CREATION: {
    FAILED: createError(
      'prompt_creation_failed',
      ErrorType.API_ERROR,
      'Failed to create suggestion prompt',
      'Unable to create suggestions at this time'
    ),
    INVALID_RESPONSE: createError(
      'invalid_response',
      ErrorType.API_ERROR,
      'Invalid response format from AI service',
      'Unable to process suggestions at this time'
    )
  }
};

export interface TCreateSuggestionPromptParams {
  personResult: GetPersonResult;
  suggestions: Suggestion[];
}

export async function createContentSuggestionPrompt({
  personResult,
  suggestions
}: TCreateSuggestionPromptParams): Promise<TServiceResponse<TSuggestionPromptResponse>> {
  try {
    const promptMessages: ChatCompletionOptions['messages'] = [
      $system(buildContentSuggestionAugmentationSystemPrompt().prompt),
      $user(
        buildContentSuggestionAugmentationUserPrompt({
          personResult,
          suggestions
        }).prompt
      )
    ];

    const response_format = zodResponseFormat(SuggestionPromptResponseSchema, 'suggestion_prompt');

    const response = await chatCompletion({
      messages: promptMessages,
      response_format
    });

    // Add debug logging
    console.log('Suggestions::CreateContentSuggestionAugmentationSystemPrompt::response', response);

    if (!response?.content) {
      return {
        data: null,
        error: { ...ERRORS.PROMPT_CREATION.FAILED, details: response }
      };
    }

    try {
      const parsedContent = JSON.parse(response.content);
      return { data: parsedContent, error: null };
    } catch (error) {
      return {
        data: null,
        error: {
          ...ERRORS.PROMPT_CREATION.INVALID_RESPONSE,
          details: error
        }
      };
    }
  } catch (error) {
    return {
      data: null,
      error: {
        ...ERRORS.PROMPT_CREATION.FAILED,
        details: error
      }
    };
  }
}

const buildContentSuggestionAugmentationSystemPrompt = () => ({
  prompt: stripIndents`
      You are an AI prompt engineer that helps understand and categorize content interests.
      Analyze the provided person information and return:
      1. A singluar key topic or interest
      2. A prompt to get at least 3 content suggestions

      RETURN JSON IN THIS FORMAT:
      {
        "topics": ["topic1"],
        "prompt": "Enhanced description incorporating key details..."
      }

      Guidelines:
      - Topics should be specific and relevant to the person
      - Extract exclusively and only 1 main topic of interest from the provided information
      - The prompt should be detailed but concise
      - Do not include the names of any specific people in the prompt

    Example Output 1: 
    {
      "topics": ["fiction writing"],
      "prompt": "Find 3 peices of content on tips and resources for writing fiction, especially for beginners who want to develop their novel writing skills, and recommendations for books or workshops that could help in this journey."
    }

    Example Output 2:
    {
      "topics": ["real estate"],
      "prompt": "Find 3 peices of content or events happening in Houston, Texas that an 45 year old real estate developer would be interested in."
    }
    `
});

export interface TBuildContentSuggestionAugmentationUserPromptParams {
  personResult: GetPersonResult;
  suggestions: Suggestion[];
}

export const buildContentSuggestionAugmentationUserPrompt = ({
  personResult,
  suggestions
}: TBuildContentSuggestionAugmentationUserPromptParams) => {
  const { person, interactions } = personResult;
  const { first_name } = person;

  const previousInteractionsNotes = interactions
    ?.map((interaction) => {
      return `- ${interaction.type}: ${interaction.note}`;
    })
    .join('\n');

  // Get content titles from suggestions
  const suggestionsTitles =
    suggestions && suggestions.length > 0
      ? suggestions
          .map((suggestion) => SuggestionSchema.safeParse(suggestion.suggestion).data?.title)
          .filter((title) => title !== null)
      : [];

  const prompt = stripIndents`
  This is what I know about ${first_name}.
  
  Previous Interactions & Notes:
  ${previousInteractionsNotes && wrapTicks(previousInteractionsNotes)}
  
  ${
    suggestionsTitles.length !== 0
      ? `
    These are the titles of article suggestions that you have generated the past 30 days:
    ${wrapTicks(suggestionsTitles.join('\n'), 'Previous Suggestions')}
    
    Try to generate a prompt that does not overlap with the previous suggestions. However, if there is not have enough infomration about the person to suggest topics outside of the scope of the previous suggestions, then it is okay to suggest similar content. If the previous suggestions focus too much on one topic, suggest topics that could be applicable to interesting to many audiences.
    `
      : ''
  }
  `;
  console.log('Suggestions::CreateContentSuggestionAugmentationUserPrompt::prompt', prompt);

  return { prompt };
};
