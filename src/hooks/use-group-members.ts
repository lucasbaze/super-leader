import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { Person } from '@/types/database';

export function useGroupMembers(id: string) {
  return useQuery<Person[]>({
    queryKey: ['group-members', id],
    queryFn: async () => {
      const response = await fetch(`/api/groups/${id}/people`);
      const json = await response.json();

      if (!response.ok || !json.success) {
        errorToast.show(json.error);
      }

      return json.data;
    }
  });
}
