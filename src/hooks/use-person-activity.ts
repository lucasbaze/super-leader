import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { TCreateInteractionRequest } from '@/app/api/person/[id]/activity/route';
import { TInteraction } from '@/services/person/person-activity';

export function usePersonActivity(personId: string) {
  return useQuery<TInteraction[]>({
    queryKey: ['person-activity', personId],
    queryFn: async () => {
      const response = await fetch(`/api/person/${personId}/activity`);
      const json = await response.json();

      if (json.error) throw new Error(json.error);
      return json.data;
    }
  });
}

export function useCreateInteraction(personId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TCreateInteractionRequest) => {
      const response = await fetch(`/api/person/${personId}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const json = await response.json();
      if (json.error) throw json.error;
      return json.data as TInteraction;
    },
    onSuccess: () => {
      // Invalidate and refetch the activity list
      queryClient.invalidateQueries({ queryKey: ['person-activity', personId] });
    }
  });
}
