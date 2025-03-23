import { z } from 'zod';

const SectionSchema = z.object({
  title: z.string().describe('The title of the section'),
  icon: z.string().describe('The icon of the section'),
  content: z.string().describe('The summarized content of the section in markdown format')
});

const SuggestionSchema = z.object({
  content: z
    .string()
    .describe('The content of the suggestion for the user about the person in markdown format'),
  reason: z.string().describe('The reason for the suggestion in markdown format')
});

const GroupedSectionSchema = z.object({
  sections: z.array(SectionSchema),
  suggestion: SuggestionSchema
});

const SinglePersonSummarySchema = z.object({
  completeness: z
    .number()
    .describe('A score between 0 and 100 indicating the completeness of the summary'),
  highlights: z
    .string()
    .describe('The personalized 2 - 3 brief of most important facts about the person.'),
  groupedSections: z.array(GroupedSectionSchema)
});

// Example usage:
// const parsedData = SinglePersonSummarySchema.parse(yourJsonData);

export { SinglePersonSummarySchema };
