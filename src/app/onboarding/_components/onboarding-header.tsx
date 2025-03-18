'use client';

import { TypingText } from '@/components/animated/typing-text';
import { Conversation } from '@/types/database';

interface OnboardingHeaderProps {
  conversations: Conversation[];
  conversationId: string | null;
  onSelectConversation: (id: string) => void;
}

export function OnboardingHeader({
  conversations,
  conversationId,
  onSelectConversation
}: OnboardingHeaderProps) {
  // For onboarding, we might want a simpler header or no header at all
  return (
    <>
      <h2 className='text-2xl font-bold'>Welcome to Superleader</h2>
      <TypingText text="Let's get started!" />
    </>
  );
}
