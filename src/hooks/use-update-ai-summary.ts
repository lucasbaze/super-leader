import { useMutation, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { toError } from '@/lib/errors';

interface UpdateAISummaryParams {
  personId: string;
}

export function useUpdateAISummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ personId }: UpdateAISummaryParams) => {
      const response = await fetch(`/api/person/${personId}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const json = await response.json();

      if (!response.ok) {
        throw json.error;
      }

      return json.data;
    },
    onError: (err) => {
      errorToast.show(toError(err));
    },
    onSuccess: (_, { personId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['person', personId] });
      queryClient.invalidateQueries({ queryKey: ['people'] });
    }
  });
}
