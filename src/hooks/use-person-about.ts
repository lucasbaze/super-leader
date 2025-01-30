import type { Database } from '@/types/database';
import { useQuery } from '@tanstack/react-query';

type Person = Database['public']['Tables']['person']['Row'];
type ContactMethod = Database['public']['Tables']['contact_methods']['Row'];
type Address = Database['public']['Tables']['addresses']['Row'];
type Website = Database['public']['Tables']['websites']['Row'];

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
