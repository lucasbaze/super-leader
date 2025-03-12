import { TASK_TYPES } from '@/lib/tasks/task-types';
import { TaskContent } from '@/services/tasks/types';
import { DBClient, TaskSuggestion } from '@/types/database';

interface CreateTestTaskSuggestionParams {
  userId: string;
  personId: string;
  type?: (typeof TASK_TYPES)[keyof typeof TASK_TYPES];
  content?: TaskContent;
  endAt?: string;
}

export async function createTestTaskSuggestion(
  db: DBClient,
  params: CreateTestTaskSuggestionParams
): Promise<TaskSuggestion> {
  const defaultContent: TaskContent = {
    action: 'Test action',
    context: 'Test context',
    suggestion: 'Test suggestion'
  };

  const { data: task, error } = await db
    .from('task_suggestion')
    .insert({
      user_id: params.userId,
      person_id: params.personId,
      type: params.type || TASK_TYPES.SUGGESTED_REMINDER,
      content: params.content || defaultContent,
      end_at: params.endAt || new Date(Date.now() + 86400000).toISOString() // Tomorrow
    })
    .select('*')
    .single();

  if (error) throw error;
  if (!task) throw new Error('Failed to create test task suggestion');

  return task;
}

// Keep the old function for backward compatibility
export async function createTestTask({
  db,
  data
}: {
  db: DBClient;
  data: {
    user_id: string;
    person_id: string;
    type: (typeof TASK_TYPES)[keyof typeof TASK_TYPES];
    content: TaskContent;
    end_at?: string;
  };
}) {
  return createTestTaskSuggestion(db, {
    userId: data.user_id,
    personId: data.person_id,
    type: data.type,
    content: data.content,
    endAt: data.end_at
  });
}
