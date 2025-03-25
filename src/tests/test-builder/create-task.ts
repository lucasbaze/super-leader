import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { CreateTaskSuggestion, SendMessageAction, TaskContext } from '@/services/tasks/types';
import { DBClient, TaskSuggestion } from '@/types/database';

type CreateTestTaskSuggestionParams = {
  userId: string;
  personId: string;
  trigger?: CreateTaskSuggestion['trigger'];
  context?: CreateTaskSuggestion['context'];
  suggestedActionType?: CreateTaskSuggestion['suggestedActionType'];
  suggestedAction?: CreateTaskSuggestion['suggestedAction'];
  endAt?: CreateTaskSuggestion['endAt'];
};

export async function createTestTaskSuggestion(
  db: DBClient,
  params: CreateTestTaskSuggestionParams
): Promise<TaskSuggestion> {
  const defaultContent: TaskContext = {
    context: 'Test context',
    callToAction: 'Test call to action'
  };

  const defaultSuggestedAction: SendMessageAction = {
    messageVariants: [
      {
        tone: 'friendly',
        message: 'Happy birthday! Hope you have a fantastic day!'
      }
    ]
  };

  const { data: task, error } = await db
    .from('task_suggestion')
    .insert({
      user_id: params.userId,
      person_id: params.personId,
      trigger: params.trigger || TASK_TRIGGERS.BIRTHDAY_REMINDER,
      context: params.context || defaultContent,
      end_at: params.endAt || new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      suggested_action_type: params.suggestedActionType || SUGGESTED_ACTION_TYPES.SEND_MESSAGE,
      suggested_action: params.suggestedAction || defaultSuggestedAction
    })
    .select('*')
    .single();

  if (error) throw error;
  if (!task) throw new Error('Failed to create test task suggestion');

  return task;
}
