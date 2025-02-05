import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { TCreateGroupRequest } from '@/app/api/groups/route';
import { errorToast } from '@/components/errors/error-toast';
import { Group } from '@/types/database';

export function useGroups() {
  return useQuery<Group[]>({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await fetch('/api/groups');
      const json = await response.json();
      if (json.error) throw json.error;
      return json.data;
    }
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TCreateGroupRequest) => {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const json = await response.json();
      if (json.error) {
        errorToast.show(json.error);
      }
      return json.data as Group;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
}
