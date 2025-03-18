import { Metadata } from 'next';

import { SplitLayout } from '@/components/layout/split-column-layout';

import { OnboardingProgress } from './_components/onboarding-progress';

export const metadata: Metadata = {
  title: 'Onboarding - Super Leader',
  description: 'Welcome to Super Leader - Complete your onboarding to get started'
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <SplitLayout leftContent={<OnboardingProgress />}>{children}</SplitLayout>;
}
