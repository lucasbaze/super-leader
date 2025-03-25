import { useMutation, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
// import { generateObjectFromAI } from '@/vendors/ai/generate-object';
import { TaskActionType } from '@/services/tasks/types';

interface TaskUpdateData {
  taskId: string;
  action: TaskActionType;
  newEndDate?: string;
}

interface TaskCreateData {
  personId: string;
  type: string;
  content: {
    action: string;
    context: string;
    suggestion: string;
  };
  endAt: string;
}

export function useTaskActions() {
  const queryClient = useQueryClient();

  // Mutation for updating task status
  const updateTask = useMutation({
    mutationFn: async ({ taskId, action, newEndDate }: TaskUpdateData) => {
      const response = await fetch('/api/tasks/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, action, newEndDate })
      });

      const result = await response.json();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate the tasks query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      errorToast.show(error);
    }
  });

  // Function to handle snoozing with AI-determined new date
  // const snoozeTask = async (taskId: string) => {
  //   try {
  //     // Get AI to determine a new date
  //     const newDateResult = await generateObjectFromAI({
  //       instruction: 'Generate a new end date for a snoozed task, typically 1-3 days in the future, in ISO format with timezone.',
  //       schema: {
  //         type: 'object',
  //         properties: {
  //           newEndDate: {
  //             type: 'string',
  //             format: 'date-time',
  //             description: 'The new end date and time in ISO format with timezone'
  //           },
  //           explanation: {
  //             type: 'string',
  //             description: 'A brief explanation of why this date was chosen'
  //           }
  //         },
  //         required: ['newEndDate']
  //       }
  //     });

  //     if (newDateResult.error) {
  //       throw new Error('Failed to determine new date for task');
  //     }

  //     // Use the AI-determined date to snooze the task
  //     return updateTask.mutateAsync({
  //       taskId,
  //       action: TaskActionType.SNOOZE,
  //       newEndDate: newDateResult.data.newEndDate
  //     });
  //   } catch (error: any) {
  //     errorToast.show(error);
  //     throw error;
  //   }
  // };

  return {
    completeTask: (taskId: string) =>
      updateTask.mutateAsync({ taskId, action: TaskActionType.COMPLETE }),
    skipTask: (taskId: string) => updateTask.mutateAsync({ taskId, action: TaskActionType.SKIP }),
    // snoozeTask,
    // markAsBadSuggestion: (taskId: string) =>
    //   updateTask.mutateAsync({ taskId, action: TaskActionType.BAD_SUGGESTION }),
    isLoading: updateTask.isPending
  };
}
