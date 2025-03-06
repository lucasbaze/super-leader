'use client';

import { useQuery } from '@tanstack/react-query';

import { UserProfileResponse } from '@/app/api/user/profile/route';
import { errorToast } from '@/components/errors/error-toast';

/**
 * Hook to fetch the current user's profile
 */
export function useUserProfile() {
  return useQuery<UserProfileResponse>({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await fetch('/api/user/profile');

      const json = await response.json();

      if (!response.ok) {
        // TODO: Add Error Logger
        errorToast.show(json.error);
      }

      return json.data;
    }
  });
}
