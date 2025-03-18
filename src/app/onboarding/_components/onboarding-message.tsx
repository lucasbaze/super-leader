'use client';

import { Message } from 'ai';

import { useChatConfig } from '@/lib/chat/chat-context';
import { cn } from '@/lib/utils';

import { OnboardingToolCallIndicator } from './onboarding-tool-indicator';

interface OnboardingMessageProps {
  message: Message;
  isLastMessage: boolean;
}

export function OnboardingMessage({ message, isLastMessage }: OnboardingMessageProps) {
  const { config } = useChatConfig();

  const isAssistant = message.role === 'assistant';
  const isUser = message.role === 'user';

  if (message.role === 'system') {
    return null;
  }

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start',
        config.messageStyles.container
      )}>
      <div
        className={cn(
          'flex max-w-[90%] flex-col gap-2',
          isAssistant && config.messageStyles.assistant,
          isUser && config.messageStyles.user
        )}>
        {message.parts?.map((part, index) => {
          switch (part.type) {
            case 'text':
              return <div key={index}>{part.text}</div>;
            case 'tool-invocation':
              return (
                <OnboardingToolCallIndicator
                  key={index}
                  toolName={part.toolInvocation.toolName}
                  state={part.toolInvocation.state}
                  args={part.toolInvocation.args}
                />
              );
          }
        })}
        {/* Handle function calls differently in onboarding */}
        {/* {message.function_call ? (
          <OnboardingToolCallIndicator
            toolName={message.function_call.name}
            args={JSON.parse(message.function_call.arguments)}
          />
        ) : (
          <div className='whitespace-pre-wrap'>{message.content}</div>
        )} */}
      </div>
    </div>
  );
}
