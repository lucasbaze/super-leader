import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import type { TInteraction } from '@/services/person/person-activity';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';
import type { TPersonGroup } from '@/types/custom';
import type { Address, ContactMethod, Person, Website } from '@/types/database';

interface PersonAboutData {
  person: Person;
  contactMethods?: ContactMethod[];
  addresses?: Address[];
  websites?: Website[];
  groups?: TPersonGroup[];
  interactions?: TInteraction[];
  tasks?: GetTaskSuggestionResult[];
}

interface UsePersonOptions {
  withContactMethods?: boolean;
  withAddresses?: boolean;
  withWebsites?: boolean;
  withGroups?: boolean;
  withInteractions?: boolean;
  withTasks?: boolean;
}

export function usePerson(id: string | null, options: UsePersonOptions = {}) {
  return useQuery<PersonAboutData>({
    queryKey: ['person', id, 'about', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.withContactMethods) params.append('withContactMethods', 'true');
      if (options.withAddresses) params.append('withAddresses', 'true');
      if (options.withWebsites) params.append('withWebsites', 'true');
      if (options.withGroups) params.append('withGroups', 'true');
      if (options.withInteractions) params.append('withInteractions', 'true');
      if (options.withTasks) params.append('withTasks', 'true');

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
