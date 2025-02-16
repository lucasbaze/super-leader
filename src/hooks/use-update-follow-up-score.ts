import { useMutation, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { toError } from '@/lib/errors';
import { Person } from '@/types/database';

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
    onMutate: async ({ personId, manualScore }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['people'] });

      // Snapshot the previous value
      const previousPeople = queryClient.getQueryData<Person[]>(['people']);

      // Optimistically update the cache
      queryClient.setQueryData<Person[]>(['people'], (old) => {
        if (!old) return [];
        return old.map((person) =>
          person.id === personId
            ? {
                ...person,
                follow_up_score: manualScore ?? 0.5
              }
            : person
        );
      });

      // Return the snapshotted value
      return { previousPeople };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context we returned above
      if (context?.previousPeople) {
        queryClient.setQueryData(['people'], context.previousPeople);
      }
      errorToast.show(toError(err));
    }
    // onSuccess: (data, { personId }) => {
    //   // Update both queries with the actual response
    //   queryClient.setQueryData<Person[]>(['people'], (old) => {
    //     if (!old) return [];
    //     return old.map((person) =>
    //       person.id === personId
    //         ? {
    //             ...person,
    //             follow_up_score: data.follow_up_score
    //           }
    //         : person
    //     );
    //   });
    //   queryClient.invalidateQueries({ queryKey: ['person', personId] });
    // }
  });
}
