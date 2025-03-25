import { SUGGESTED_ACTION_TYPES } from '@/lib/tasks/constants';
import { GetTaskSuggestionResult } from '@/services/tasks/types';

import { AddNoteTask } from './add-note-task';
import { BuyGiftTask } from './buy-gift-task';
import { SendMessageTask } from './send-message-task';
import { ShareContentTask } from './share-content-task';

interface TaskRendererProps {
  task: GetTaskSuggestionResult;
}

export const TaskRenderer = ({ task }: TaskRendererProps) => {
  switch (task.suggestedActionType) {
    case SUGGESTED_ACTION_TYPES.SEND_MESSAGE:
      return <SendMessageTask task={task} />;
    case SUGGESTED_ACTION_TYPES.SHARE_CONTENT:
      return <ShareContentTask task={task} />;
    case SUGGESTED_ACTION_TYPES.ADD_NOTE:
      return <AddNoteTask task={task} />;
    case SUGGESTED_ACTION_TYPES.BUY_GIFT:
      return <BuyGiftTask task={task} />;
    default:
      console.warn(
        `No task card component found for action type: ${task.suggestedActionType}`,
        task
      );
      return null;
  }
};
