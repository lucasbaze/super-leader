import { stripIndents } from 'common-tags';
import { zodResponseFormat } from 'openai/helpers/zod';

import { createError } from '@/lib/errors';
import { $system, $user } from '@/lib/llm/messages';
import { wrapTicks } from '@/lib/utils/strings';
import { GetPersonResult } from '@/services/person/get-person';
import { Person } from '@/types/custom';
import { Suggestion } from '@/types/database';
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
}

export async function generateContentTopics({ personSummary, previousTopics }: GenerateTopicParams) {
  const prompt = stripIndents`
    
    # Objective
      Your objective is to generate a high level topic and a prompt to get content suggestions.
      Analyze the provided person information and return:
      1. A singluar key topic or interest
      2. A prompt to get at least 3 content suggestions

      RETURN JSON IN THIS FORMAT:
      {
        "topic": "the high level topic",
        "prompt": "Enhanced description incorporating key details..."
      }

    ## Guidelines:
      - There should only be 1 topic and it should be specific and relevant to the person
      - Extract exclusively and only 1 main topic of interest from the provided information
      - The prompt should be detailed but concise
      - Do not include the names of any specific people in the prompt
      - Try not to repeat the same topic as the previous suggestions, but it's okay to overlap.
      - If there is not enough information about the person to generate a clearly defined topic, pick a topic that would apply to a wide audience.

    ## Example Outputs: 
      {
        "topic": "fiction writing tips",
        "prompt": "Find 3 pieces of content on tips for writing fiction, especially for beginners who want to develop their novel writing skills."
      }

      {
        "topic": "real estate events",
        "prompt": "Find 3 events happening in Houston, Texas that an 45 year old real estate developer would be interested in."
      }
      
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

export interface TBuildContentSuggestionAugmentationUserPromptParams {
  personResult: GetPersonResult;
  suggestions: Suggestion[];
  requestedContent?: string;
}

export const buildContentSuggestionAugmentationUserPrompt = ({
  personResult,
  suggestions,
  requestedContent
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
  Please generate a prompt that will help generate content suggestions that are relevant to ${first_name}.

  ${requestedContent ? `I want to get content suggestions explicitly for the following content: ${requestedContent}. You can deprioritize previous suggestions or previous notes about the person as I want to focus on the aforementioned specific content.` : ''}
  
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

/*

generateGiftTopics() {

  const prompt = buildGiftSuggestionPrompt({ ... })

  return generateTopicForContentSuggestionsByPerson({
    personResult,
    suggestions,
    type: 'gift',
    requestedContent
  })
}


generateContentTopics




*/
