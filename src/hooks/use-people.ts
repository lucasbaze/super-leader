import { Person } from '@/types/people';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const response = await fetch('/api/person', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch people');
      return response.json();
    }
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
