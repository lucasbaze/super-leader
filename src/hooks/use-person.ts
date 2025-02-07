import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import type { TPersonGroup } from '@/types/custom';
import type { Address, ContactMethod, Person, Website } from '@/types/database';

interface PersonAboutData {
  person: Person;
  contactMethods: ContactMethod[];
  addresses: Address[];
  websites: Website[];
  groups: TPersonGroup[];
}

export function usePerson(id: string) {
  return useQuery<PersonAboutData>({
    queryKey: ['person', id, 'about'],
    queryFn: async () => {
      const response = await fetch(`/api/person/${id}`);
      const json = await response.json();

      if (!response.ok) {
        // TODO: Add Error Logger
        errorToast.show(json.error);
      }

      return json.data;
    }
  });
}
