'use client';

import { useQuery } from '@tanstack/react-query';

import { ApiResponse } from '@/types/api-response';
import { UserContext } from '@/types/database';

export interface UserContextResponse {
  contexts: UserContext[];
}

export function useUserContext() {
  return useQuery<UserContextResponse, Error>({
    queryKey: ['user-context'],
    queryFn: async () => {
      const response = await fetch('/api/user/context');

      if (!response.ok) {
        throw new Error('Failed to fetch user context');
      }

      const json = (await response.json()) as ApiResponse<UserContextResponse>;

      if (json.error) {
        throw new Error(json.error.message);
      }

      return json.data as UserContextResponse;
    }
  });
}
