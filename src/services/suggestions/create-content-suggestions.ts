import { stripIndents } from 'common-tags';
import { zodResponseFormat } from 'openai/helpers/zod';

import { createError } from '@/lib/errors';
import { $system, $user } from '@/lib/llm/messages';
import { Suggestion } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { TServiceResponse } from '@/types/service-response';
import { chatCompletion, type ChatCompletionOptions } from '@/vendors/open-router';

import { ContentSuggestionsResponseSchema, SuggestionSchema, TSuggestion } from './types';

// Define errors
export const ERRORS = {
  CONTENT_CREATION: {
    FAILED: createError(
      'content_creation_failed',
      ErrorType.API_ERROR,
      'Failed to create content suggestions',
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

export interface TCreateContentSuggestionsParams {
  userContent: string;
  suggestions: Suggestion[];
}

export async function createContentSuggestions({
  userContent,
  suggestions
}: TCreateContentSuggestionsParams): Promise<TServiceResponse<TSuggestion[]>> {
  try {
    const messages: ChatCompletionOptions['messages'] = [
      $system(buildContentSuggestionPrompt().prompt),
      $user(buildContentSuggestionUserPrompt(userContent, suggestions).prompt)
    ];

    const plugins = [
      {
        id: 'web',
        max_results: 3
      }
    ];

    const response_format = zodResponseFormat(ContentSuggestionsResponseSchema, 'suggestions');

    const response = await chatCompletion({
      messages,
      response_format,
      plugins
    });

    if (!response?.content) {
      return { data: null, error: ERRORS.CONTENT_CREATION.FAILED };
    }

    const parsedContent = ContentSuggestionsResponseSchema.safeParse(JSON.parse(response.content));

    if (!parsedContent.success) {
      return {
        data: null,
        error: { ...ERRORS.CONTENT_CREATION.INVALID_RESPONSE, details: parsedContent.error }
      };
    }

    return { data: parsedContent.data.suggestions, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        ...ERRORS.CONTENT_CREATION.FAILED,
        details: error
      }
    };
  }
}

const buildContentSuggestionPrompt = () => ({
  prompt: stripIndents`You are an AI content curator that finds the most recent, engaging and interesting content available. We're looking for content that would be worth sharing and creating a conversation with the other person.
   
  Instructions:
  - Search the web for content that is less than 1 year old, relevant to the user's interests, engaging or interesting, recent. The content doesn't have to be popular, but it should be interesting.
  
  RETURN JSON IN THIS FORMAT:
    {
      "suggestions": [
        {
          "title": "Title of the content",
          "contentUrl": "URL of the content",
          "reason": "Reason for the suggestion based on the user's interests"
        }
      ]
    }

  `
});
const buildContentSuggestionUserPrompt = (userPrompt: string, suggestions: Suggestion[]) => {
  // If no suggestions, return prompt
  if (!suggestions || suggestions.length === 0) {
    return { prompt: userPrompt };
  }

  // Get content urls from suggestions
  const suggestionsContent = suggestions
    .map((suggestion) => SuggestionSchema.safeParse(suggestion.suggestion).data?.contentUrl)
    .filter((contentUrl) => contentUrl !== null);

  // Add suggestions to prompt
  const prompt = `${userPrompt}

  These are suggestions that you have generated the past 30 days:
  ${suggestionsContent.join('\n')}
  
  Do not generate any suggestions that are similar to these.
  `;

  console.log('Suggestions::CreateContentSuggestionAugmentationUserPrompt::prompt', prompt);

  return {
    prompt
  };
};
