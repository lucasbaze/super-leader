'use client';

import { Loader2 } from 'lucide-react';

export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h1 className="text-xl font-medium">Loading your onboarding experience...</h1>
      <p className="text-sm text-muted-foreground mt-2">
        We're preparing a personalized guided experience for you.
      </p>
    </div>
  );
}