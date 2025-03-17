import { Metadata } from 'next';

import { TypingText } from '@/components/animated/typing-text';
import { SplitLayout } from '@/components/layout/split-column-layout';

export const metadata: Metadata = {
  title: 'Onboarding - Super Leader',
  description: 'Welcome to Super Leader - Complete your onboarding to get started'
};

// TODO: Possibly replace this with an React based animation library like Framer Motion
function WelcomeContent() {
  return (
    <div className='space-y-4'>
      <TypingText text={`Welcome to Superleader`} className='text-4xl font-bold' delay={70} />
      <TypingText text="Let's get started" className='text-xl' delay={70} />
    </div>
  );
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <SplitLayout leftContent={<WelcomeContent />}>{children}</SplitLayout>;
}
