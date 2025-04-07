'use client';

import { CreateMessage, Message } from 'ai';

import { AssistantMessageRenderer } from '@/components/chat/messages/assistant-message-renderer';
import { MarkdownMessage } from '@/components/chat/messages/markdown-message';
import { ToolCallIndicator } from '@/components/chat/messages/tool-call-indicator';
import { PendingAction } from '@/hooks/chat/use-chat-interface';
import { useChatConfig } from '@/lib/chat/chat-context';
import { cn } from '@/lib/utils';

interface MessageProps {
  message: Message;
  isLoading: boolean;
  isLastMessage: boolean;
  pendingAction: PendingAction;
  setPendingAction: (actions: PendingAction) => void;
  addToolResult: (result: { toolCallId: string; result: string }) => void;
  append: (message: CreateMessage) => void;
}

export function MainMessage({ message, append }: MessageProps) {
  const { config } = useChatConfig();

  const isUser = message.role === 'user';

  if (message.role === 'system') {
    return null;
  }

  if (isUser) {
    return (
      <div className={cn('flex w-full justify-end', config.messageStyles.container)}>
        <div className={cn('flex max-w-[90%] flex-col gap-2', isUser && config.messageStyles.user)}>
          {message.parts?.map((part, index) => {
            switch (part.type) {
              case 'text':
                return (
                  <div key={index}>
                    <MarkdownMessage content={part.text} isUserMessage={true} />
                  </div>
                );
            }
          })}
        </div>
      </div>
    );
  }

  const toolCalls = message.parts?.filter((part) => part.type === 'tool-invocation');

  return (
    <div className={cn('flex w-full flex-col justify-start gap-2', config.messageStyles.container)}>
      {toolCalls?.map((toolCall, index) => (
        <ToolCallIndicator
          key={index}
          toolName={toolCall.toolInvocation.toolName}
          state={toolCall.toolInvocation.state}
          args={toolCall.toolInvocation.args}
        />
      ))}
      <AssistantMessageRenderer
        message={message}
        append={append}
        messageStyles={config.messageStyles.assistant ?? ''}
      />
    </div>
  );
}
