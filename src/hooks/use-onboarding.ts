import { useMutation, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { Onboarding } from '@/types/custom';

import { useUserProfile } from './use-user-profile';

export function useUserOnboarding() {
  const { data: userProfile, isLoading } = useUserProfile();
  return {
    isLoading,
    onboardingStatus: userProfile?.onboarding as Onboarding
  };
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH'
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        errorToast.show(json.error);
        throw json.error;
      }

      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    }
  });
}
