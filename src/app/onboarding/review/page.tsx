'use client';

import { useRouter } from 'next/navigation';

import { useChat } from 'ai/react';

import { MarkdownMessage } from '@/components/chat/messages/markdown-message';
import { Loader } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserOnboarding } from '@/hooks/use-onboarding';
import { useUserProfile } from '@/hooks/use-user-profile';
import { onboardingStepsQuestionsAndCriteria } from '@/lib/onboarding/onboarding-steps';

import { OnboardingProgress } from '../_components/onboarding-progress';
import OnboardingLoading from '../loading';

export default function OnboardingReviewPage() {
  const router = useRouter();
  const { data: userProfile, isLoading: isLoadingUserProfile } = useUserProfile();
  const { onboardingStatus, isLoading: isLoadingOnboarding } = useUserOnboarding();

  const svaChatResponse = useChat({
    api: '/api/chat/generate/share-value-ask',
    id: 'onboarding-review-share-value-ask'
  });

  const handleGenerateSVA = () => {
    svaChatResponse.append({
      role: 'system',
      content: 'Generate a share, value-add, and ask for me.'
    });
  };

  if (isLoadingOnboarding || isLoadingUserProfile) {
    return <OnboardingLoading />;
  }

  // Check if all steps are completed
  const allStepsCompleted = Object.entries(onboardingStepsQuestionsAndCriteria).every(
    ([key]) => onboardingStatus?.steps?.[key]?.completed
  );

  if (!allStepsCompleted) {
    return router.push('/onboarding');
  }

  return (
    <div className='relative h-full overflow-hidden rounded-lg bg-background p-3'>
      <div className='mx-auto max-w-[80%] pt-6'>
        {/* <div className='space-y-2'>
          <h2 className='text-xl font-semibold'>2. Review Action Plans </h2>
          <p className='text-muted-foreground'>
            Let's review your profile and generate your personalized playbook.
          </p>
        </div> */}

        <Tabs defaultValue='share-value-ask' className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='share-value-ask'>
              Share, Value-Add, & Ask{' '}
              {svaChatResponse.isLoading && <Loader className='size-4 animate-spin' />}
            </TabsTrigger>
            <TabsTrigger value='relationship-map'>Relationship Map</TabsTrigger>
            <TabsTrigger value='super-leader-playbook'>Superleader Playbook</TabsTrigger>
          </TabsList>

          <TabsContent value='share-value-ask' className='space-y-4'>
            <Button onClick={handleGenerateSVA}>Generate SVA</Button>
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Share, Value-Add, & Ask</h3>
              <p className='text-muted-foreground'>
                This is a simple formula to help you quickly connect with the right people in a
                meaningful way.
              </p>
            </div>
            <div className='rounded-md border border-dashed p-4 text-center text-muted-foreground'>
              {svaChatResponse.messages.length > 0 && (
                <MarkdownMessage
                  content={svaChatResponse.messages[svaChatResponse.messages.length - 1].content}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value='relationship-map' className='space-y-4'>
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Relationship Map</h3>
              <p className='text-muted-foreground'>
                This is a map of the relationships you should probably build or focus on to achieve
                your goals.
              </p>
            </div>
            <div className='rounded-md border border-dashed p-4 text-center text-muted-foreground'>
              Generated after building profile
            </div>
          </TabsContent>

          <TabsContent value='super-leader-playbook' className='space-y-4'>
            <div className='space-y-2'>
              <h3 className='text-lg font-medium'>Superleader Playbook</h3>
              <p className='text-muted-foreground'>
                This is a playbook on how you personally can become a super leader.
              </p>
            </div>
            <div className='rounded-md border border-dashed p-4 text-center text-muted-foreground'>
              Generated after building profile
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
