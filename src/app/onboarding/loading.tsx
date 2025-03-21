'use client';

import { Loader2 } from 'lucide-react';

export default function OnboardingLoading() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <Loader2 className='mb-4 size-12 animate-spin text-primary' />
      <h1 className='text-xl font-medium'>Loading your onboarding experience...</h1>
      <p className='mt-2 text-sm text-muted-foreground'>
        We're preparing a personalized guided experience for you.
      </p>
    </div>
  );
}
