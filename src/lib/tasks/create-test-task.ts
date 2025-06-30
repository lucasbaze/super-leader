import { dateHandler } from '@/lib/dates/helpers';
import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { GetTaskSuggestionResult } from '@/services/tasks/types';

// Helper function to create test tasks
export function createTestTask(overrides = {}): GetTaskSuggestionResult {
  return {
    id: '1',
    trigger: TASK_TRIGGERS.FOLLOW_UP.slug,
    context: {
      context: 'Follow up on project discussion',
      callToAction: 'Send a message to check on project progress'
    },
    endAt: dateHandler().toISOString(),
    completedAt: null,
    skippedAt: null,
    snoozedAt: null,
    createdAt: dateHandler().subtract(1, 'day').toISOString(),
    updatedAt: dateHandler().subtract(1, 'day').toISOString(),
    person: {
      id: '123',
      firstName: 'John',
      lastName: 'Doe'
    },
    suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
    suggestedAction: {
      messageVariants: [
        {
          tone: 'friendly',
          message: 'Hey, how is the project going?'
        }
      ]
    },
    ...overrides
  };
}
