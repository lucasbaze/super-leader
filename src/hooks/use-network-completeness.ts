'use client';

import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { TNetworkCompletenessData } from '@/services/network/get-network-completeness';

export function useNetworkCompleteness() {
  return useQuery<TNetworkCompletenessData>({
    queryKey: ['network-completeness'],
    queryFn: async () => {
      const response = await fetch('/api/network/completeness');
      const json = await response.json();

      if (!response.ok) {
        errorToast.show(json.error?.displayMessage || 'Failed to fetch network completeness data');
        throw new Error(json.error?.message || 'Failed to fetch network completeness data');
      }

      return json.data;
    }
  });
}
