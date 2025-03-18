'use client';

import { Message } from 'ai';

import { useChatConfig } from '@/lib/chat/chat-context';

import { OnboardingMessage } from './onboarding-message';

interface OnboardingMessagesListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function OnboardingMessagesList({
  messages,
  isLoading,
  messagesEndRef,
  containerRef
}: OnboardingMessagesListProps) {
  const { config } = useChatConfig();

  return (
    <div ref={containerRef} className='p-4'>
      <div className='flex flex-col gap-6'>
        {messages.map((message, index) => (
          <OnboardingMessage
            key={message.id || index}
            message={message}
            isLastMessage={index === messages.length - 1}
          />
        ))}

        {/* Input will be rendered here for the last message if it's user's turn */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
