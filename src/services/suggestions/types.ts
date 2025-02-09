import { z } from 'zod';

/*
 * Message Suggestions
 */
// Define the schema
export const MessageSuggestionSchema = z.object({
  text: z.string().describe('The text of the message that the user can share'),
  tone: z.enum(['casual', 'professional', 'friendly']).describe('The tone of the message')
});
export type TMessageSuggestion = z.infer<typeof MessageSuggestionSchema>;

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

export type TSuggestionPromptResponse = z.infer<typeof SuggestionPromptResponseSchema>;

/*
 * Suggestions
 */
// Suggestion Schema for content suggestions
export const SuggestionSchema = z.object({
  contentUrl: z.string().describe('The URL of the content'),
  title: z.string().describe('The title of the content'),
  reason: z.string().describe('A 1 sentence reason for the suggestion')
});
export type TSuggestion = z.infer<typeof SuggestionSchema>;

// Content Suggestions Response Schema
export const ContentSuggestionsResponseSchema = z.object({
  suggestions: z.array(SuggestionSchema)
});

export type TGetContentSuggestionsForPersonResponse = {
  suggestions: TSuggestion[];
  topics: TSuggestionPromptResponse['topics'];
};
