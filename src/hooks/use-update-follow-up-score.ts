import { useMutation, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';

interface UpdateFollowUpScoreParams {
  personId: string;
  manualScore?: number;
}

export function useUpdateFollowUpScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ personId, manualScore }: UpdateFollowUpScoreParams) => {
      const response = await fetch(`/api/person/${personId}/follow-up-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ manualScore })
      });

      const json = await response.json();

      if (!response.ok) {
        throw json.error;
      }

      return json.data;
    },
    onSuccess: (_, { personId }) => {
      // Invalidate and refetch person data
      queryClient.invalidateQueries({ queryKey: ['person', personId] });
    }
    // onError: (error: Error) => {
    //   errorToast.show(error.message);
    // }
  });
}
