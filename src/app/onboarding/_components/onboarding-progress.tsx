'use client';

import { useUserOnboarding } from '@/hooks/use-onboarding';
import { onboardingStepsQuestionsAndCriteria } from '@/lib/onboarding/onboarding-steps';
import { cn } from '@/lib/utils';

const ONBOARDING_STEPS = [
  { key: 'personal', label: 'Personal Information' },
  { key: 'professional', label: 'Professional Details' }

  // Add other steps as needed
] as const;

export function OnboardingProgress() {
  const { onboardingStatus } = useUserOnboarding();

  const steps = Object.entries(onboardingStatus?.steps || []);

  console.log(steps);

  return (
    <div className='mx-auto flex w-full max-w-md flex-col items-center'>
      <div className='w-full space-y-4'>
        {steps &&
          steps.map(([key, step]) => (
            <div key={key} className='flex items-center space-x-4 rounded-lg bg-white/5 p-4'>
              <div
                className={cn(
                  'h-6 w-6 rounded-full border-2',
                  step.completed ? 'border-primary bg-primary' : 'border-gray-400'
                )}
              />
              <span className='text-lg'>{key}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
