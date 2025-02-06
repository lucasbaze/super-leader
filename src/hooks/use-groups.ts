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

export function useAddGroupMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      groupId,
      groupSlug,
      personIds
    }: {
      groupId: string;
      groupSlug: string;
      personIds: string[];
    }) => {
      const response = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ personIds, groupSlug })
      });

      const json = await response.json();
      if (json.error) {
        errorToast.show(json.error);
        throw json.error;
      }
      return json.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['group-members', variables.groupSlug] });
    }
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE'
      });

      const json = await response.json();
      if (json.error) {
        errorToast.show(json.error);
        throw json.error;
      }
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
}
