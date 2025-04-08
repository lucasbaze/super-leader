import { useMutation, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { TaskActionType } from '@/services/tasks/types';

interface TaskUpdateData {
  taskId: string;
  action: TaskActionType;
  newEndDate?: string;
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

  return {
    completeTask: (taskId: string) =>
      updateTask.mutateAsync({ taskId, action: TaskActionType.COMPLETE }),
    skipTask: (taskId: string) => updateTask.mutateAsync({ taskId, action: TaskActionType.SKIP }),
    isLoading: updateTask.isPending
  };
}
