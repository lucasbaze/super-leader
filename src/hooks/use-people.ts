import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Person } from '@/types/database';

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const response = await fetch('/api/people', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch people');
      
return response.json();
    },
    staleTime: 1000 * 60 * 5, // Serve cached data for 5 minutes
    refetchOnMount: false, // Avoid refetch on remount
    refetchOnWindowFocus: false // No refetch on tab focus
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (personData: Partial<Person>) => {
      const response = await fetch('/api/people/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personData)
      });
      if (!response.ok) throw new Error('Failed to create person');
      
return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the people query
      queryClient.invalidateQueries({ queryKey: ['people'] });
    }
  });
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: ['person', id],
    queryFn: async () => {
      const response = await fetch(`/api/person/${id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch person');
      
return response.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
}
