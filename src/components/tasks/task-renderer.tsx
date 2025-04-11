import { SUGGESTED_ACTION_TYPES } from '@/lib/tasks/constants';
import { GetTaskSuggestionResult } from '@/services/tasks/types';

import { AddNoteTask } from './add-note-task';
import { BuyGiftTask } from './buy-gift-task';
import { CompletedTaskCard } from './completed-task-card';
import { SendMessageTask } from './send-message-task';
import { ShareContentTask } from './share-content-task';
import { SkippedTaskCard } from './skipped-task-card';

interface TaskRendererProps {
  task: GetTaskSuggestionResult;
}

export const TaskRenderer = ({ task }: TaskRendererProps) => {
  // Handle completed tasks
  if (task.completed_at) {
    return <CompletedTaskCard task={task} />;
  }

  // Handle skipped tasks
  if (task.skipped_at) {
    return <SkippedTaskCard task={task} />;
  }

  // Handle active tasks
  switch (task.suggestedActionType) {
    case SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug:
      return <SendMessageTask task={task} />;
    case SUGGESTED_ACTION_TYPES.SHARE_CONTENT.slug:
      return <ShareContentTask task={task} />;
    case SUGGESTED_ACTION_TYPES.ADD_NOTE.slug:
      return <AddNoteTask task={task} />;
    case SUGGESTED_ACTION_TYPES.BUY_GIFT.slug:
      return <BuyGiftTask task={task} />;
    default:
      console.warn(`No task card component found for action type: ${task.suggestedActionType}`, task);
      return null;
  }
};
