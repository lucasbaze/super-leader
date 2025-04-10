import { createError } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { getPerson, GetPersonResult } from '@/services/person/get-person';
import { Suggestion } from '@/types/custom';
import { DBClient } from '@/types/database';
import { ErrorType } from '@/types/errors';
import { ServiceResponse } from '@/types/service-response';

import { formatPersonSummary } from '../person/format-person-summary';
import { generateContentSuggestions } from './generate-content-variants';
import { generateContentTopics, generateGiftTopics } from './generate-topic-for-content-suggestions';
import { saveSuggestions } from './save-suggestions';

// Define errors
export const ERRORS = {
  SUGGESTIONS: {
    PROMPT_CREATION_ERROR: createError(
      'suggestions_prompt_creation_error',
      ErrorType.API_ERROR,
      'Failed to create content suggestions prompt',
      'Unable to create content suggestions prompt at this time'
    ),
    FETCH_ERROR: createError(
      'suggestions_fetch_error',
      ErrorType.API_ERROR,
      'Failed to fetch content suggestions',
      'Unable to generate content suggestions at this time'
    ),
    PERSON_REQUIRED: createError(
      'person_required',
      ErrorType.VALIDATION_ERROR,
      'Person ID is required',
      'Please provide a person to get suggestions for'
    ),
    PREVIOUS_SUGGESTIONS_FETCH_ERROR: createError(
      'previous_suggestions_fetch_error',
      ErrorType.API_ERROR,
      'Failed to fetch previous content suggestions',
      'Unable to generate content suggestions at this time'
    ),
    SUGGESTIONS_SAVE_ERROR: createError(
      'suggestions_save_error',
      ErrorType.API_ERROR,
      'Failed to save content suggestions',
      'Unable to save content suggestions at this time'
    ),
    AI_SERVICE_ERROR: createError(
      'ai_service_error',
      ErrorType.API_ERROR,
      'AI service failed to generate content suggestions',
      'Unable to generate content suggestions at this time'
    )
  }
};

// -------------------
// Prepare Suggestion Context
// -------------------

interface PrepareSuggestionContextParams {
  db: DBClient;
  userId: string;
  personId: string;
  type: 'content' | 'gift';
  requestedContent?: string;
}

interface SuggestionContext {
  personId: string;
  type: 'content' | 'gift';
  requestedContent?: string;
  person: GetPersonResult['person'];
  personSummary: string;
  previousSuggestions: Suggestion[];
}

async function prepareSuggestionContext({
  db,
  personId,
  userId,
  type,
  requestedContent
}: PrepareSuggestionContextParams): Promise<ServiceResponse<SuggestionContext>> {
  if (!personId) return { data: null, error: ERRORS.SUGGESTIONS.PERSON_REQUIRED };

  const personResult = await getPerson({ db, personId, withInteractions: true });
  if (personResult.error || !personResult.data) return { data: null, error: personResult.error };

  const personSummary = await formatPersonSummary({ db, personId });
  if (personSummary.error || !personSummary.data) return { data: null, error: personSummary.error };

  const daysAgo = type === 'gift' ? 60 : 30;
  const since = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  const { data: suggestions, error } = await db
    .from('suggestions')
    .select('*')
    .eq('person_id', personId)
    .eq('user_id', userId)
    .eq('type', type)
    .gte('created_at', since)
    .returns<Suggestion[]>();

  if (error) {
    errorLogger.log({
      ...ERRORS.SUGGESTIONS.PREVIOUS_SUGGESTIONS_FETCH_ERROR,
      details: error
    });
  }

  return {
    data: {
      personId,
      type,
      requestedContent,
      person: personResult.data.person,
      personSummary: personSummary.data,
      previousSuggestions: suggestions || []
    },
    error: null
  };
}

// -------------------
// Strategy Mapping
// -------------------

const promptStrategy = {
  content: generateContentTopics,
  gift: generateGiftTopics
};

const suggestionStrategy = {
  content: generateContentSuggestions,
  gift: generateContentSuggestions // same as above
};

// -------------------
// Main Orchestrator
// -------------------

// Service params interface
export interface GetSuggestionsForPersonParams {
  db: DBClient;
  personId: string;
  userId: string;
  type?: 'content' | 'gift';
  requestedContent?: string;
}

export async function getContentSuggestionsForPerson({
  db,
  personId,
  userId,
  type = 'content',
  requestedContent
}: GetSuggestionsForPersonParams): Promise<
  // ServiceResponse<GetContentSuggestionsForPersonResponse>
  ServiceResponse<Suggestion[]>
> {
  try {
    const contextResult = await prepareSuggestionContext({
      db,
      personId,
      userId,
      type,
      requestedContent
    });

    if (contextResult.error || !contextResult.data) return { data: null, error: contextResult.error };

    // If we have requested specific content, we'll skip the topic generation step.

    const context = contextResult.data;
    const generateTopic = promptStrategy[type];
    const generateSuggestions = suggestionStrategy[type];

    // Create the augmented prompt with type
    const generatedTopic = await generateTopic({
      personSummary: context.personSummary,
      previousTopics: Array.from(new Set(context.previousSuggestions.map((suggestion) => suggestion.topic))),
      quantity: 2,
      requestedContent
    });
    console.log('Suggestions::GetContentSuggestionsForPerson::generatedTopic', generatedTopic);

    if (generatedTopic.error || !generatedTopic.data) {
      return { data: null, error: generatedTopic.error };
    }

    // Create content suggestions
    const suggestionsResult = await generateSuggestions({
      topicPrompt: generatedTopic.data.prompt,
      previousSuggestionTitles: context.previousSuggestions.map(
        (suggestion) => suggestion.suggestion.suggestedContent.title
      )
    });

    if (suggestionsResult.error || !suggestionsResult.data) {
      return { data: null, error: suggestionsResult.error };
    }

    console.log(
      'Suggestions::GetContentSuggestionsForPerson::suggestionsResult',
      JSON.stringify(suggestionsResult.data, null, 2)
    );

    // Save suggestions with correct type
    const suggestions = suggestionsResult.data.contentVariants.map((suggestion) => ({
      person_id: personId,
      user_id: userId,
      suggestion,
      topic: generatedTopic.data?.topic || 'Unknown',
      type
    }));

    // Save the suggestions to the database using the new service
    const savedSuggestionsResult = await saveSuggestions({
      db,
      suggestions
    });

    if (savedSuggestionsResult.error || !savedSuggestionsResult.data) {
      return { data: null, error: savedSuggestionsResult.error };
    }

    // Return both the suggestions and the prompt response
    return {
      data: savedSuggestionsResult.data,
      error: null
    };
  } catch (error) {
    const serviceError = {
      ...ERRORS.SUGGESTIONS.FETCH_ERROR,
      details: error
    };
    errorLogger.log(serviceError);
    return { data: null, error: serviceError };
  }
}
