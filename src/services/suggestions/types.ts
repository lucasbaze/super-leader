import { z } from 'zod';

// Define the suggestion schema with Zod
export const SuggestionSchema = z.object({
  contentUrl: z.string(),
  title: z.string(),
  reason: z.string()
});

export const ContentSuggestionsResponseSchema = z.object({
  suggestions: z.array(SuggestionSchema)
});

export type TSuggestion = z.infer<typeof SuggestionSchema>;

export const SuggestionPromptResponseSchema = z.object({
  topics: z.array(z.string()),
  prompt: z.string()
});

export type TSuggestionPromptResponse = z.infer<typeof SuggestionPromptResponseSchema>;
