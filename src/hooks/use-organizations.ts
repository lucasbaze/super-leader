import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { GetOrganizationsResult } from '@/services/organization/get-organizations';

export type UseOrganizationResult = GetOrganizationsResult;

export function useOrganizations() {
  return useQuery<UseOrganizationResult[]>({
    queryKey: ['organizations'],
    queryFn: async (): Promise<UseOrganizationResult[]> => {
      const response = await fetch('/api/organizations', { credentials: 'include' });
      const json = await response.json();

      if (!response.ok || !json.success) {
        // TODO: Add Error Logger
        errorToast.show(json.error);
      }

      return json.data;
    },
    staleTime: 1000 * 60 * 5, // Serve cached data for 5 minutes
    refetchOnMount: false, // Avoid refetch on remount
    refetchOnWindowFocus: false // No refetch on tab focus
  });
}
