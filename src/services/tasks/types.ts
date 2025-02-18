import { z } from 'zod';

import { TASK_TYPES } from '@/lib/tasks/task-types';
import { Person, TaskSuggestion } from '@/types/database';

export const taskContentSchema = z.object({
  action: z.string(),
  context: z.string(),
  suggestion: z.string()
});

export type TTaskContent = z.infer<typeof taskContentSchema>;
export type GetTaskSuggestionResult = Omit<
  TaskSuggestion,
  'type' | 'content' | 'person_id' | 'user_id'
> & {
  type: (typeof TASK_TYPES)[keyof typeof TASK_TYPES];
  content: TTaskContent;
  person: Pick<Person, 'id' | 'first_name' | 'last_name'>;
};
