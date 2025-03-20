'use client';

import { Check } from '@/components/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { useUserOnboarding } from '@/hooks/use-onboarding';
import { onboardingStepsQuestionsAndCriteria } from '@/lib/onboarding/onboarding-steps';
import { cn } from '@/lib/utils';

const ONBOARDING_STEPS = [
  { key: 'personal', label: 'Personal Information' },
  { key: 'professional', label: 'Professional Details' }

  // Add other steps as needed
] as const;

const getStepLabel = (step: string) => {
  return onboardingStepsQuestionsAndCriteria[
    step as keyof typeof onboardingStepsQuestionsAndCriteria
  ]?.label;
};

export function OnboardingProgress() {
  const { onboardingStatus } = useUserOnboarding();

  const steps = Object.entries(onboardingStatus?.steps || []);
  const allSteps = Object.entries(onboardingStepsQuestionsAndCriteria);

  return (
    <div className='no-scrollbar mx-auto flex w-full max-w-3xl flex-col gap-8 overflow-y-auto p-10'>
      {/* Top Section - Build Profile */}
      <section className='space-y-6'>
        <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>1. Your Superleader Profile</h2>
          <p className='text-muted-foreground'>
            Everything is tailored to you. The more you share, the better the results.
          </p>
        </div>

        <div className='ml-4 w-full'>
          {allSteps.map(([key, step]) => {
            const isCompleted = steps.find(([stepKey]) => stepKey === key)?.[1]?.completed;

            return (
              <div key={key} className='flex items-center space-x-4 pb-1'>
                {isCompleted ? (
                  <Check className='size-4 text-green-500' />
                ) : (
                  <div className='size-2 rounded-full border-2 border-gray-400' />
                )}
                <span className='text-md'>{getStepLabel(key)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom Section - Generated Content */}
      {/* <section>
        <h2 className='mb-2 text-xl font-semibold'>2. Review Action Plans </h2>
        <p className='mb-2 text-muted-foreground'>
          Playbooks built from your profile & power connecting best practices.
        </p>
        <Accordion type='single' collapsible className='space-y-2'>
          <AccordionItem value='share-value-ask' className='rounded-lg border bg-background px-4'>
            <AccordionTrigger className='text-md'>Share Value Ask</AccordionTrigger>
            <AccordionContent>
              <div className='space-y-4'>
                <p className='text-muted-foreground'>
                  This is a simple formulae to help you quickly connect with the right people in a
                  meaningful way.
                </p>
                <div className='rounded-md border border-dashed p-4 text-center text-muted-foreground'>
                  Generated after building profile
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value='relationship-map' className='rounded-lg border bg-background px-4'>
            <AccordionTrigger className='text-md'>Relationship Map</AccordionTrigger>
            <AccordionContent>
              <div className='space-y-4'>
                <p className='text-muted-foreground'>
                  This is a map of the relationships you should probably build or focus on to
                  achieve your goals.
                </p>
                <div className='rounded-md border border-dashed p-4 text-center text-muted-foreground'>
                  Generated after building profile
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value='super-leader-playbook'
            className='rounded-lg border bg-background px-4'>
            <AccordionTrigger className='text-md'>Superleader Playbook</AccordionTrigger>
            <AccordionContent>
              <div className='space-y-4'>
                <p className='text-muted-foreground'>
                  This is a playbook on how you personally can become a super leader.
                </p>
                <div className='rounded-md border border-dashed p-4 text-center text-muted-foreground'>
                  Generated after building profile
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section> */}
    </div>
  );
}
