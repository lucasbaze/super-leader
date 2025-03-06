import { useCallback, useState } from 'react';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { debounce } from '@/lib/utils';
import { SimpleSearchPeopleResult } from '@/services/people';

export function useSimpleSearchPeople(debounceMs = 500) {
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: people,
    isLoading,
    isFetching
  } = useQuery<SimpleSearchPeopleResult[]>({
    queryKey: ['people', 'search', searchTerm],
    queryFn: async () => {
      const response = await fetch(`/api/people/simple-search?q=${encodeURIComponent(searchTerm)}`);
      const json = await response.json();
      if (json.error) throw json.error;
      return json.data;
    },
    // Prevents "flashing" when search term changes and data returned in an empty array temporarily
    placeholderData: keepPreviousData,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => setSearchTerm(value), debounceMs),
    [debounceMs]
  );

  return {
    searchTerm,
    setSearchTerm: debouncedSetSearchTerm,
    people: people || [],
    isLoading,
    isFetching
  };
}
