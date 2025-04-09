import { z } from 'zod';

import { Suggestion } from '@/types/database';

/*
 * Message Suggestions
 */
// Define the schema
export const MessageSuggestionSchema = z.object({
  text: z.string().describe('The text of the message that the user can share'),
  tone: z.enum(['casual', 'professional', 'friendly']).describe('The tone of the message')
});
export type MessageSuggestion = z.infer<typeof MessageSuggestionSchema>;

export const MessageSuggestionsResponseSchema = z.object({
  suggestions: z.array(MessageSuggestionSchema)
});

/*
 * Suggestion Prompt
 */
// Suggestion Prompt Response Schema
export const SuggestionPromptResponseSchema = z.object({
  topics: z.array(z.string()).describe('The topic of the content'),
  prompt: z.string().describe('A prompt to find the content')
});

export type SuggestionPromptResponse = z.infer<typeof SuggestionPromptResponseSchema>;

/*
 * Topic Generation
 */

export const topicGenerationSchema = z.object({
  topic: z.string().describe('The singular topic of the content to generate suggestion for'),
  prompt: z.string().describe('A prompt to define the topic and find the content.')
});

export type TopicGenerationSchema = z.infer<typeof topicGenerationSchema>;

/*
 * Suggestions
 */
// Suggestion Schema for content suggestions
export const SuggestionSchema = z.object({
  contentUrl: z.string().describe('The URL of the content'),
  title: z.string().describe('The title of the content'),
  reason: z.string().describe('A 1 sentence reason for the suggestion')
});
export type ContentSuggestion = z.infer<typeof SuggestionSchema>;

// Extend TSuggestion to include the database id
export type ContentSuggestionWithId = ContentSuggestion & Pick<Suggestion, 'id'>;

// Content Suggestions Response Schema
export const ContentSuggestionsResponseSchema = z.object({
  suggestions: z.array(SuggestionSchema)
});
export type ContentSuggestionsResponse = z.infer<typeof ContentSuggestionsResponseSchema>;
export type GetContentSuggestionsForPersonResponse = {
  suggestions: ContentSuggestionWithId[];
  topics: SuggestionPromptResponse['topics'];
};

export const SuggestionType = z.enum(['content', 'message', 'gift']);

/*
 * Suggestions 2.0
 *
 */

/*
 * New Content Suggestion Schema
 */

export const suggestedContentSchema = z.object({
  title: z.string().describe('The title of the content (article, video, etc...)'),
  description: z.string().describe('The description of the content (article, video, etc...)'),
  url: z.string().describe('The URL of the content (article, video, etc...)')
});

export type SuggestedContent = z.infer<typeof suggestedContentSchema>;

export const suggestedMessageSchema = z.object({
  tone: z
    .string()
    .describe(
      'The tone of the message such as friendly, formal, funny, etc... in relation to the message that is going to be sent'
    ),
  message: z
    .string()
    .describe(
      'The personalized message that I could text or email to the person about the found content. e.g. "I found this cool event. Thought you might be interested in it." or "Found this article. I\'m curious what you think." or "Saw this and thought of you." including the content'
    )
});

export type SuggestedMessage = z.infer<typeof suggestedMessageSchema>;

export const contentVariantSchema = z.object({
  suggestedContent: suggestedContentSchema,
  messageVariants: z.array(suggestedMessageSchema)
});

export type ContentVariant = z.infer<typeof contentVariantSchema>;

export const contentVariantsSchema = z.object({
  contentVariants: z.array(contentVariantSchema)
});

export type ContentVariants = z.infer<typeof contentVariantsSchema>;
