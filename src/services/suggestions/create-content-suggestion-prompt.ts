import { stripIndents } from 'common-tags';
import { zodResponseFormat } from 'openai/helpers/zod';

import { createError } from '@/lib/errors';
import { $system, $user } from '@/lib/llm/messages';
import { wrapTicks } from '@/lib/utils/strings';
import { GetPersonResult } from '@/services/person/get-person';
import { Suggestion } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';
import { generateObject } from '@/vendors/ai';

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
    PARSE_ERROR: createError(
      'parse_error',
      ErrorType.API_ERROR,
      'Failed to parse response from AI service',
      'Unable to process suggestions at this time'
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
  type: 'content' | 'gift';
}

export async function createContentSuggestionPrompt({
  personResult,
  suggestions,
  type
}: TCreateSuggestionPromptParams): Promise<TServiceResponse<TSuggestionPromptResponse>> {
  try {
    const promptMessages = [
      $system(
        type === 'gift'
          ? buildGiftSuggestionPrompt().prompt
          : buildContentSuggestionAugmentationSystemPrompt().prompt
      ),
      $user(
        buildContentSuggestionAugmentationUserPrompt({
          personResult,
          suggestions
        }).prompt
      )
    ];

    const response = await generateObject({
      messages: promptMessages,
      schema: SuggestionPromptResponseSchema
    });

    // Add debug logging
    console.log('Suggestions::CreateContentSuggestionAugmentationSystemPrompt::response', response);

    if (!response) {
      return {
        data: null,
        error: { ...ERRORS.PROMPT_CREATION.FAILED, details: response }
      };
    }

    const parsedContent = SuggestionPromptResponseSchema.safeParse(response);

    if (!parsedContent.success) {
      return {
        data: null,
        error: { ...ERRORS.PROMPT_CREATION.PARSE_ERROR, details: parsedContent.error }
      };
    }

    return { data: parsedContent.data, error: null };
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

const buildGiftSuggestionPrompt = () => ({
  prompt: stripIndents`You are an AI gift advisor that suggests thoughtful and personalized gifts. 
  Analyze the provided person information and return:
      1. A singluar key topic or interest
      2. A prompt to get at most 3 gift suggestions
  
  Guidelines:
  - Suggest a singular type of gift that match the person's interests and activities
  - The gift can be of any price range, but should err on being more premium
  - Consider both practical, meaningful, and experiential gifts
  - Avoid generic suggestions unless they specifically match the person's interests
  
  RETURN JSON IN THIS FORMAT:
    {
      "topics": ["gift category"],
      "prompt": "Detailed prompt for finding gift suggestions"
    }

  Example Output 1: 
    {
      "topics": ["coffee"],
      "prompt": "Find 3 possible coffee subscriptions that would be interesting to a coffee lover."
    }

  Example Output 1: 
    {
      "topics": ["cars"],
      "prompt": "Find 3 possible tickets to car events or car shows that would be interesting to a car enthusiast."
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
    These are the titles of suggestions that you have generated the past:
    ${wrapTicks(suggestionsTitles.join('\n'), 'Previous Suggestions')}
    
    Try to generate a prompt that does not overlap with the previous suggestions. However, if there is not have enough infomration about the person to suggest topics outside of the scope of the previous suggestions, then it is okay to suggest similar content. If the previous suggestions focus too much on one topic, suggest topics that could be applicable to interesting to many audiences.
    `
      : ''
  }
  `;
  console.log('Suggestions::CreateContentSuggestionAugmentationUserPrompt::prompt', prompt);

  return { prompt };
};
