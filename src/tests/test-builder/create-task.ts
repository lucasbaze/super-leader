import { TASK_TYPES } from '@/lib/tasks/task-types';
import { TTaskContent } from '@/services/tasks/types';
import { DBClient } from '@/types/database';

interface CreateTestTaskParams {
  db: DBClient;
  data: {
    user_id: string;
    person_id: string;
    type: (typeof TASK_TYPES)[keyof typeof TASK_TYPES];
    content: TTaskContent;
    end_at?: string;
  };
}

export async function createTestTask({ db, data }: CreateTestTaskParams) {
  const { data: task, error } = await db
    .from('task_suggestion')
    .insert({
      user_id: data.user_id,
      person_id: data.person_id,
      type: data.type,
      content: data.content,
      end_at: data.end_at || new Date().toISOString()
    })
    .select('*')
    .single();

  if (error) throw error;
  if (!task) throw new Error('Failed to create test task');

  return task;
}
