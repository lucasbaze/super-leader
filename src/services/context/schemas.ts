import { z } from 'zod';

const SectionSchema = z.object({
  title: z.string().describe('The title of the section'),
  icon: z.string().describe('The icon of the section'),
  content: z.string().describe('The content of the section in markdown format')
});

const GroupedSectionSchema = z.object({
  title: z.string().describe('The title of the grouped section that appears in the navigation'),
  sections: z.array(SectionSchema)
});

const ContextSummarySchema = z.object({
  completeness: z.number().describe('A score between 0 and 100 indicating the completeness of the summary'),
  groupedSections: z.array(GroupedSectionSchema),
  followUpQuestions: z
    .array(z.string())
    .describe('A list of follow up questions to ask the user about the person to improve the summary')
});

export type Section = z.infer<typeof SectionSchema>;
export type GroupedSection = z.infer<typeof GroupedSectionSchema>;
export type ContextSummary = z.infer<typeof ContextSummarySchema>;

export { ContextSummarySchema };
