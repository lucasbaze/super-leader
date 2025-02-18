import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';

export function useTasks() {
  return useQuery<GetTaskSuggestionResult[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks');
      const json = await response.json();
      if (json.error) {
        errorToast.show(json.error);
        throw json.error;
      }
      return json.data;
    },
    staleTime: 1000 * 60 * 5, // Serve cached data for 5 minutes
    refetchOnMount: false, // Avoid refetch on remount
    refetchOnWindowFocus: false // No refetch on tab focus
  });
}
