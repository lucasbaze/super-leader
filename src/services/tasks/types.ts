import { z } from 'zod';

import { TASK_TYPES } from '@/lib/tasks/task-types';
import { Person, TaskSuggestion } from '@/types/database';
import { ServiceResponse } from '@/types/service-response';

export const taskContentSchema = z.object({
  action: z.string().describe('A brief action label for the task (2-5 words)'),
  context: z.string().describe('Context about the task (1 sentence max)'),
  suggestion: z.string().describe('Specific suggestion for completing the task (1 sentence max)')
});

export const taskSuggestionSchema = z.object({
  user_id: z.string().min(1).describe('The ID of the user the task is associated with'),
  person_id: z.string().min(1).describe('The ID of the person the task is associated with'),
  type: z.enum(Object.values(TASK_TYPES) as [string, ...string[]]).describe('The type of task'),
  content: taskContentSchema,
  end_at: z
    .string()
    .datetime()
    .optional()
    .describe('The ISO date-time string when the task should be completed')
});

export type TaskContent = z.infer<typeof taskContentSchema>;
export type GetTaskSuggestionResult = Omit<
  TaskSuggestion,
  'type' | 'content' | 'person_id' | 'user_id'
> & {
  type: (typeof TASK_TYPES)[keyof typeof TASK_TYPES];
  content: TaskContent;
  person: Pick<Person, 'id' | 'first_name' | 'last_name'>;
};

export enum TaskActionType {
  COMPLETE = 'complete',
  SKIP = 'skip',
  SNOOZE = 'snooze',
  BAD_SUGGESTION = 'bad_suggestion'
}

export interface TaskUpdateResult {
  id: string;
  success: boolean;
}

export interface NewTaskParams {
  userId: string;
  personId: string;
  type: (typeof TASK_TYPES)[keyof typeof TASK_TYPES];
  content: TaskContent;
  endAt: string;
}

export type CreateTaskServiceResult = ServiceResponse<TaskUpdateResult>;
