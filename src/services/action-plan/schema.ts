import { z } from 'zod';

import { SUGGESTED_ACTION_TYPE_SLUGS } from '@/lib/tasks/constants';

const ExecutiveSummarySchema = z.object({
  title: z.string(),
  description: z.string(),
  content: z.string()
});

const TaskSchema = z.object({
  personId: z.string().describe('The UUID of the person to assign to the task.'),
  personName: z.string().describe('The name of the person to assign to the task.'),
  taskContext: z.string().describe('The context of the task.'),
  taskType: z.nativeEnum(SUGGESTED_ACTION_TYPE_SLUGS).describe('The type of task to assign to the person.'),
  taskDueDate: z.string().describe('The ISO8601 formatted due date of the task that is in the future.')
  // task_priority: z.enum(['low', 'medium', 'high', 'urgent']),
  // task_due_date: z.string(),
});

export type ActionPlanTask = z.infer<typeof TaskSchema>;

const ActionPlanTaskWithIdSchema = TaskSchema.extend({
  id: z.string().describe('The UUID of the task.')
});

export type ActionPlanTaskWithId = z.infer<typeof ActionPlanTaskWithIdSchema>;

const GroupSectionSchema = z.object({
  title: z.string(),
  icon: z.string(),
  description: z.string(),
  tasks: z.array(TaskSchema)
});

export const GenerateActionPlanSchema = z.object({
  buildDate: z.string(),
  executiveSummary: ExecutiveSummarySchema,
  groupSections: z.array(GroupSectionSchema),
  quote: z.string()
});

export type GenerateActionPlan = z.infer<typeof GenerateActionPlanSchema>;
