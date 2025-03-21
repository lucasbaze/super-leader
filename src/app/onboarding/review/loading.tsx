'use client';

import { Loader2 } from 'lucide-react';

export default function OnboardingReviewLoading() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <Loader2 className='mb-4 h-12 w-12 animate-spin text-primary' />
      <h1 className='text-xl font-medium'>Loading your review experience...</h1>
      <p className='mt-2 text-sm text-muted-foreground'>
        We're preparing your personalized review and playbook.
      </p>
    </div>
  );
}
