import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { DateRange, getDateRangeForTimePeriod, TimePeriod } from '@/lib/tasks/time-periods';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';

export function useTasks(personId?: string, timePeriod?: TimePeriod, dateRange?: DateRange) {
  return useQuery<GetTaskSuggestionResult[]>({
    queryKey: ['tasks', personId, timePeriod, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (personId) params.append('personId', personId);

      // Use provided date range or calculate from time period
      const range = dateRange || (timePeriod ? getDateRangeForTimePeriod(timePeriod) : undefined);

      if (range) {
        params.append('after', range.after);
        params.append('before', range.before);
      }

      const url = `/api/tasks${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
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

export function useGenerateTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // mutationFn: async (personId: string) => {
      const response = await fetch('/api/tasks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
        // body: JSON.stringify({ personId })
      });

      const result = await response.json();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate tasks queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (error: any) => {
      errorToast.show(error);
    }
  });
}
