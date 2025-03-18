'use client';

import { useRouter } from 'next/navigation';

import { useUserOnboarding } from '@/hooks/use-onboarding';

import { OnboardingChat } from './_components/onboarding-chat';
import OnboardingLoading from './loading';

export default function OnboardingPage() {
  const router = useRouter();
  const { onboardingStatus, isLoading: isLoadingOnboarding } = useUserOnboarding();

  if (isLoadingOnboarding) {
    return <OnboardingLoading />;
  }

  if (onboardingStatus?.completed) {
    return router.push('/app');
  }

  return <OnboardingChat />;
}
