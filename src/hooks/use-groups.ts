import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { Group } from '@/types/database';

export function useGroups() {
  return useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await fetch('/api/groups', { credentials: 'include' });
      const json = await response.json();

      if (!response.ok || !json.success) {
        errorToast.show(json.error);
      }

      return json.data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
}
