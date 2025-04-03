'use client';

import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { NetworkActivityData } from '@/services/network/get-network-activity';

export function useNetworkActivity(days: number = 7) {
  return useQuery<NetworkActivityData>({
    queryKey: ['network-activity', days],
    queryFn: async () => {
      const response = await fetch(`/api/network/activity?days=${days}`);
      const json = await response.json();

      if (!response.ok) {
        errorToast.show(json.error?.displayMessage || 'Failed to fetch network activity data');
        throw new Error(json.error?.message || 'Failed to fetch network activity data');
      }

      return json.data;
    }
  });
}
