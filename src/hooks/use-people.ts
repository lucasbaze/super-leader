import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { TBaseError } from '@/lib/errors';
import { ApiResponse } from '@/types/api-response';
import { Person } from '@/types/database';

export function usePeople() {
  return useQuery<ApiResponse<Person[]>, TBaseError>({
    queryKey: ['people'],
    queryFn: async (): Promise<ApiResponse<Person[]>> => {
      const response = await fetch('/api/people', { credentials: 'include' });
      const json = await response.json();

      if (!response.ok || !json.success) {
        // TODO: Add Error Logger
        errorToast.show(json.error);
      }

      return json.data;
    },
    staleTime: 1000 * 60 * 5, // Serve cached data for 5 minutes
    refetchOnMount: false, // Avoid refetch on remount
    refetchOnWindowFocus: false // No refetch on tab focus
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Person>, TBaseError, Partial<Person>>({
    mutationFn: async (personData) => {
      const response = await fetch('/api/people/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personData)
      });

      const json = await response.json();

      if (!response.ok) {
        // TODO: Add Error Logger
        errorToast.show(json.error);
      }

      return json.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the people query
      queryClient.invalidateQueries({ queryKey: ['people'] });
    }
  });
}
