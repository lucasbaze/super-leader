import { stripIndents } from 'common-tags';

import { createError } from '@/lib/errors';
import { $system, $user } from '@/lib/llm/messages';
import { Suggestion } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { generateObject } from '@/vendors/ai';

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
    ),
    PARSE_ERROR: createError(
      'parse_error',
      ErrorType.API_ERROR,
      'Failed to parse response from AI service',
      'Unable to process suggestions at this time'
    )
  }
};

export interface TCreateContentSuggestionsParams {
  userContent: string;
  suggestions: Suggestion[];
  type: 'content' | 'gift';
}

export async function createContentSuggestions({
  userContent,
  suggestions,
  type
}: TCreateContentSuggestionsParams): Promise<ServiceResponse<TSuggestion[]>> {
  try {
    const messages = [
      $system(
        type === 'gift' ? buildGiftSuggestionPrompt().prompt : buildContentSuggestionPrompt().prompt
      ),
      $user(buildContentSuggestionUserPrompt(userContent, suggestions).prompt)
    ];

    const response = await generateObject({
      messages,
      schema: ContentSuggestionsResponseSchema,
      model: 'gpt-4o-search-preview'
    });

    if (!response) {
      return {
        data: null,
        error: { ...ERRORS.CONTENT_CREATION.INVALID_RESPONSE, details: response }
      };
    }

    const parsedContent = ContentSuggestionsResponseSchema.safeParse(response);

    if (!parsedContent.success) {
      return {
        data: null,
        error: { ...ERRORS.CONTENT_CREATION.PARSE_ERROR, details: parsedContent.error }
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

const buildGiftSuggestionPrompt = () => ({
  prompt: stripIndents`You are an AI gift advisor that suggests thoughtful and personalized gifts.
  
  Instructions:
  - Search for available gifts that match the person's interests
  - Include a mix of price ranges
  - Provide specific product suggestions with links
  - Explain why each gift would be meaningful
  - Be very specific about the specific gift to assist with web search and finding the gift 
  
  RETURN JSON IN THIS FORMAT:
    {
      "suggestions": [
        {
          "title": "Gift name and brief description",
          "contentUrl": "URL to purchase the gift",
          "reason": "Why this gift would be meaningful"
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

  These are suggestions that you have generated the past:
  ${suggestionsContent.join('\n')}
  
  Do not generate any suggestions that are similar to these.
  `;

  console.log('Suggestions::CreateContentSuggestionAugmentationUserPrompt::prompt', prompt);

  return {
    prompt
  };
};
