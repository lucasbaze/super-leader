'use client';

import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { getUserTimezone } from '@/lib/dates/timezones';
import { TodaysActivityData } from '@/services/network/get-todays-activity';

export function useTodaysActivity() {
  return useQuery<TodaysActivityData>({
    queryKey: ['todays-network-activity'],
    queryFn: async () => {
      const timezone = getUserTimezone();
      const response = await fetch(`/api/network/activity/today?timezone=${timezone}`);
      const json = await response.json();

      if (!response.ok) {
        errorToast.show(
          json.error?.displayMessage || "Failed to fetch today's network activity data"
        );
        throw new Error(json.error?.message || "Failed to fetch today's network activity data");
      }

      return json.data;
    }
    // Refresh every minute to keep today's data current
    // refetchInterval: 60 * 1000
  });
}
