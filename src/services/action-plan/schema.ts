import { z } from 'zod';

import { SUGGESTED_ACTION_TYPE_SLUGS } from '@/lib/tasks/constants';

const ExecutiveSummarySchema = z.object({
  title: z.string(),
  description: z.string(),
  content: z.string()
});

const TaskSchema = z.object({
  personId: z.string(),
  taskContext: z.string(),
  taskType: z.nativeEnum(SUGGESTED_ACTION_TYPE_SLUGS)
  // task_priority: z.enum(['low', 'medium', 'high', 'urgent']),
  // task_due_date: z.string(),
});

const SectionSchema = z.object({
  title: z.string(),
  icon: z.string(),
  description: z.string(),
  tasks: z.array(TaskSchema)
});

const GroupSectionSchema = z.object({
  title: z.string(),
  icon: z.string(),
  description: z.string(),
  sections: z.array(SectionSchema)
});

export const GenerateActionPlanSchema = z.object({
  buildDate: z.string(),
  executiveSummary: ExecutiveSummarySchema,
  groupSections: z.array(GroupSectionSchema),
  quote: z.string()
});
