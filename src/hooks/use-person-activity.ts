import { useQuery } from '@tanstack/react-query';

import { TInteraction } from '@/services/people/person-activity-service';

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
