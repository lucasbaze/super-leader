import { z } from 'zod';

import { TASK_TYPES } from '@/lib/tasks/task-types';
import { Person, TaskSuggestion } from '@/types/database';

export const taskContentSchema = z.object({
  action: z.string(),
  context: z.string(),
  suggestion: z.string()
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
