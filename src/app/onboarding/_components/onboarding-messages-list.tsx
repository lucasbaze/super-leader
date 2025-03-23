'use client';

import { forwardRef } from 'react';

import { Message } from 'ai';

import { MessagesListProps } from '@/components/chat/base-chat-interface';
import { Loader } from '@/components/icons';
import { useChatConfig } from '@/lib/chat/chat-context';

import { OnboardingMessage } from './onboarding-message';

export const OnboardingMessagesList = forwardRef<HTMLDivElement, MessagesListProps>(
  ({ messages, isLoading, messagesEndRef }, ref) => {
    const { config } = useChatConfig();

    return (
      <div ref={ref} className='py-4'>
        <div className='flex flex-col gap-12'>
          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            return (
              <>
                <OnboardingMessage
                  key={message.id || index}
                  message={message}
                  isLoading={isLoading}
                  isLastMessage={index === messages.length - 1}
                />
                {isLastMessage && isLoading && <Loader className='size-4 animate-spin' />}
              </>
            );
          })}

          {/* Input will be rendered here for the last message if it's user's turn */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    );
  }
);
