import { Onboarding } from '@/types/custom';

import { useUserProfile } from './use-user-profile';

export function useUserOnboarding() {
  const { data: userProfile, isLoading } = useUserProfile();
  return {
    isLoading,
    onboardingStatus: userProfile?.onboarding as Onboarding
  };
}
