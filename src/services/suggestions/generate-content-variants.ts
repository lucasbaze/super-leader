import { stripIndents } from 'common-tags';

import { createError } from '@/lib/errors';
import { $system, $user } from '@/lib/llm/open-ai-messages';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { generateSearchObject, GenerateSearchObjectOptions } from '@/vendors/openai/generate-search-object';

import { ContentVariants, contentVariantsSchema } from './types';

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

export interface GenerateContentSuggestionsParams {
  topicPrompt: string;
  previousSuggestionTitles: string[];
  // type: 'content' | 'gift';
}

export async function generateContentSuggestions({
  topicPrompt,
  previousSuggestionTitles
  // type
}: GenerateContentSuggestionsParams): Promise<ServiceResponse<ContentVariants>> {
  const systemPrompt =
    $system(stripIndents`You are an AI content curator that finds the most recent, engaging and interesting content available. We're looking for content that would be worth sharing and creating a conversation with the other person.
   
  Guidelines:
  - Look for content that is ideally less than 1 year old
  - The content should be interesting though it doesn't have to be popular
  - Try NOT to suggest the same content as the previous suggestions
  - Generate at least 3 different message variants for each suggested content
  - The message variants should be different tones and styles

  
  RETURN JSON IN THIS FORMAT:
    {
      "contentVariants": [
        {
          "suggestedContent": {
            "title": "Title of the content",
            "contentUrl": "URL of the content",
            "reason": "Reason for the suggestion based on the user's interests"
          },
          "messageVariants": [
            {
              "tone": "friendly, funny, formal, etc...",
              "message": "A message the user can send to the other person about the content"
            }
          ]
        }
      ]
    }

  `);

  const userPrompt = $user(stripIndents`
    ${topicPrompt}

    These are previous suggestions that you have generated the past:
    ${
      previousSuggestionTitles && previousSuggestionTitles.length > 0
        ? previousSuggestionTitles.join('\n')
        : 'No previous suggestions'
    }
  `);

  console.log('Suggestions::GenerateContentSuggestions::systemPrompt', systemPrompt);
  console.log('Suggestions::GenerateContentSuggestions::userPrompt', userPrompt);

  return generateContentVariants({
    messages: [systemPrompt, userPrompt]
  });
}
export interface GenerateContentVariantsParams {
  messages: GenerateSearchObjectOptions<typeof contentVariantsSchema>['messages'];
}

export async function generateContentVariants({
  messages
}: GenerateContentVariantsParams): Promise<ServiceResponse<ContentVariants>> {
  try {
    const response = await generateSearchObject({
      messages,
      schema: contentVariantsSchema,
      schemaName: 'content_variants'
    });

    console.log('Suggestions::GenerateContentVariants::response', response);

    if (!response) {
      return {
        data: null,
        error: { ...ERRORS.CONTENT_CREATION.INVALID_RESPONSE, details: response }
      };
    }

    const parsedContent = contentVariantsSchema.safeParse(response.data);

    if (!parsedContent.success) {
      return {
        data: null,
        error: { ...ERRORS.CONTENT_CREATION.PARSE_ERROR, details: parsedContent.error }
      };
    }

    return { data: parsedContent.data, error: null };
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
