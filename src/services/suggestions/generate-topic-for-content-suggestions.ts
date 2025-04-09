import { stripIndents } from 'common-tags';

import { createError } from '@/lib/errors';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';
import { generateObject } from '@/vendors/ai';

import {
  SuggestionPromptResponse,
  SuggestionPromptResponseSchema,
  SuggestionSchema,
  topicGenerationSchema,
  TopicGenerationSchema
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

export interface GenerateTopicParams {
  personSummary: string;
  previousTopics: string[];
  quantity?: number;
  requestedContent?: string;
}

export async function generateContentTopics({
  personSummary,
  previousTopics,
  quantity = 2,
  requestedContent
}: GenerateTopicParams) {
  const prompt = stripIndents`
    # Objective
      Your objective is to generate a high level topic and a prompt to get content suggestions.
      Analyze the provided person information and return:
      1. A singluar key topic or interest
      2. A prompt to get at least ${quantity} content suggestions

      RETURN JSON IN THIS FORMAT:
      {
        "topic": "the high level topic",
        "prompt": "Enhanced description incorporating key details..."
      }

    ## Guidelines:
      - If the user has specified a content type, use that content type in the topic and prompt.
      - There should only be 1 topic and it should be specific and relevant to the person
      - Extract exclusively and only 1 main topic of interest from the provided information
      - The prompt should be detailed but concise
      - Do not include the names of any specific people in the prompt
      - Try not to repeat the same topic as the previous suggestions, but it's okay to overlap.
      - If there are lots of previous topics or not enough information about the person, broaden the scope of the topic. i.e. general startup advice vs specific advice for a startup in a certain industry, or general writing tips vs writing tips for fiction writers.

    ## Example Outputs: 
      {
        "topic": "fiction writing tips",
        "prompt": "Find ${quantity} pieces of content on tips for writing fiction, especially for beginners who want to develop their novel writing skills."
      }

      {
        "topic": "real estate events",
        "prompt": "Find ${quantity} events happening in Houston, Texas that an 45 year old real estate developer would be interested in."
      }
      
    # Requested Content
    ${requestedContent ? `I want to get content suggestions in relation to the user for the following content: ${requestedContent}.` : 'No requested content was provided.'}
      
    # Previous Topic Suggestions
    ${
      previousTopics.length !== 0
        ? `${previousTopics.join(', ')}.`
        : 'No previous topics have been suggested for this person.'
    }

    # Conext About the Person
    ${personSummary || 'No person summary provided.'}

    `;
  console.log('Suggestions::generateContentTopics::prompt', prompt);

  return generateTopicForContentSuggestionsByPerson({
    prompt
  });
}

interface GenerateTopicForContentSuggestionsByPersonParams {
  prompt: string;
}

export async function generateTopicForContentSuggestionsByPerson({
  prompt
}: GenerateTopicForContentSuggestionsByPersonParams): Promise<ServiceResponse<TopicGenerationSchema>> {
  try {
    const response = await generateObject({
      prompt,
      schema: topicGenerationSchema
    });

    // Add debug logging
    console.log('Suggestions::CreateContentSuggestionAugmentationSystemPrompt::response', response);

    if (!response) {
      return {
        data: null,
        error: { ...ERRORS.PROMPT_CREATION.FAILED, details: response }
      };
    }

    const parsedContent = topicGenerationSchema.safeParse(response);

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
