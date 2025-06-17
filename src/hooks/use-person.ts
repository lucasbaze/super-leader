import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import type { GetPersonResult } from '@/services/person/get-person';
import type { TInteraction } from '@/services/person/person-activity';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';
import type { PersonGroup } from '@/types/custom';
import type { Address, ContactMethod, Person, Website } from '@/types/database';

export interface UsePersonHookResult {
  person: Person;
  contactMethods?: ContactMethod[];
  addresses?: Address[];
  websites?: Website[];
  groups?: PersonGroup[];
  interactions?: TInteraction[];
  tasks?: GetTaskSuggestionResult[];
  organizations?: GetPersonResult['organizations'];
  personPersonRelations?: GetPersonResult['personPersonRelations'];
}

interface UsePersonOptions {
  withContactMethods?: boolean;
  withAddresses?: boolean;
  withWebsites?: boolean;
  withGroups?: boolean;
  withInteractions?: boolean;
  withTasks?: boolean;
  withOrganizations?: boolean;
  withPersonPersonRelations?: boolean;
}

export function usePerson(id: string | null, options: UsePersonOptions = {}) {
  return useQuery<UsePersonHookResult>({
    queryKey: ['person', id, 'about', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.withContactMethods) params.append('withContactMethods', 'true');
      if (options.withAddresses) params.append('withAddresses', 'true');
      if (options.withWebsites) params.append('withWebsites', 'true');
      if (options.withGroups) params.append('withGroups', 'true');
      if (options.withInteractions) params.append('withInteractions', 'true');
      if (options.withTasks) params.append('withTasks', 'true');
      if (options.withOrganizations) params.append('withOrganizations', 'true');
      if (options.withPersonPersonRelations) params.append('withPersonPersonRelations', 'true');

      const queryString = params.toString();
      const url = `/api/person/${id}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);
      const json = await response.json();

      if (!response.ok) {
        // TODO: Add Error Logger
        errorToast.show(json.error);
      }

      return json.data;
    },
    enabled: !!id // Query will not execute if id is null/undefined/empty string
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (personId: string) => {
      const response = await fetch(`/api/person/${personId}`, {
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
      // Invalidate all person-related queries
      queryClient.invalidateQueries({ queryKey: ['person'] });
      // Also invalidate groups since person might be in groups
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    }
  });
}
