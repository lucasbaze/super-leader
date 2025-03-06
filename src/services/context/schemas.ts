import { z } from 'zod';

const SectionSchema = z.object({
  title: z.string().describe('The title of the section'),
  content: z.string().describe('The content of the section in markdown format')
});

const GroupedSectionSchema = z.object({
  title: z.string().describe('The title of the grouped section that appears in the navigation'),
  sections: z.array(SectionSchema)
});

const ContextSummarySchema = z.object({
  groupedSections: z.array(GroupedSectionSchema)
});

export type Section = z.infer<typeof SectionSchema>;
export type GroupedSection = z.infer<typeof GroupedSectionSchema>;
export type ContextSummary = z.infer<typeof ContextSummarySchema>;

export { ContextSummarySchema };
