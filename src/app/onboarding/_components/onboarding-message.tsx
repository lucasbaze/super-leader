'use client';

import { Message } from 'ai';

import { MarkdownMessage } from '@/components/chat/messages/markdown-message';
import { ToolCallIndicator } from '@/components/chat/messages/tool-call-indicator';
import { useChatConfig } from '@/lib/chat/chat-context';
import { cn } from '@/lib/utils';

interface OnboardingMessageProps {
  message: Message;
  isLoading: boolean;
  isLastMessage: boolean;
}

export function OnboardingMessage({ message, isLastMessage, isLoading }: OnboardingMessageProps) {
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
              return (
                <div key={index}>
                  <MarkdownMessage content={part.text} />
                </div>
              );
            case 'tool-invocation':
              return (
                <ToolCallIndicator
                  key={index}
                  toolName={part.toolInvocation.toolName}
                  state={part.toolInvocation.state}
                  args={part.toolInvocation.args}
                />
              );
          }
        })}
      </div>
    </div>
  );
}
