import { useQuery } from '@tanstack/react-query';
import type { Address, ContactMethod, Person, Website } from '@/types/database';

interface PersonAboutData {
  person: Person;
  contactMethods: ContactMethod[];
  addresses: Address[];
  websites: Website[];
}

export function usePersonAbout(id: string) {
  return useQuery<PersonAboutData>({
    queryKey: ['person', id, 'about'],
    queryFn: async () => {
      const response = await fetch(`/api/person/${id}/about`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
return response.json();
    }
  });
}
