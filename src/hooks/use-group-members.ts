import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { Person } from '@/types/database';

export function useGroupMembers(slug: string) {
  return useQuery<Person[]>({
    queryKey: ['group-members', slug],
    queryFn: async () => {
      const response = await fetch(`/api/groups/people?slug=${slug}`);
      const json = await response.json();

      if (!response.ok || !json.success) {
        errorToast.show(json.error);
      }

      return json.data;
    }
  });
}
