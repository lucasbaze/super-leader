import { z } from 'zod';

const SectionSchema = z.object({
  title: z.string().describe('The title of the section'),
  icon: z.string().describe('The icon of the section'),
  content: z.string().describe('The summarized content of the section in markdown format')
});

const SummarySectionSchema = z.object({
  sections: z
    .array(SectionSchema)
    .describe(
      'A group of sections that are generally related to each other such as "Personal", "Professional", "Goals", etc... This is not explicitly labeled, it is inferred from the content of the sections.'
    )
});

const InsightRecommendationSchema = z.object({
  title: z.string().describe('The brief title of the insight or recommendation'),
  icon: z.string().describe('An icon to match the title'),
  insightRecommendation: z
    .string()
    .describe(
      'A single insight or recommendation about the person with context embedded in the response'
    )
});

const SinglePersonSummarySchema = z.object({
  completeness: z
    .number()
    .describe('A score between 0 and 100 indicating the completeness of the summary'),
  groupedSections: z.array(SummarySectionSchema),
  insightRecommendations: z.array(InsightRecommendationSchema),
  followUpQuestions: z
    .array(z.string())
    .describe(
      'A list of follow up questions to ask the user about the person to improve the summary'
    )
});

export { SinglePersonSummarySchema };
