'use client';

import { Message } from 'ai';

import { ActionCard } from '@/components/chat/cards/action-card';
import { MarkdownMessage } from '@/components/chat/messages/markdown-message';
import { ToolCallIndicator } from '@/components/chat/messages/tool-call-indicator';
import { Loader } from '@/components/icons';
import { PendingAction } from '@/hooks/chat/use-chat-interface';
// import RingsFadeLoader from '@/components/animated/sl-loader';
import { useChatConfig } from '@/lib/chat/chat-context';
import { CHAT_TOOLS } from '@/lib/chat/tools/constants';
import { cn } from '@/lib/utils';

interface MessageProps {
  message: Message;
  isLoading: boolean;
  isLastMessage: boolean;
  pendingAction: PendingAction;
  setPendingAction: (actions: PendingAction) => void;
  addToolResult: (result: { toolCallId: string; result: string }) => void;
}

export function MainMessage({
  message,
  isLastMessage,
  isLoading,
  pendingAction,
  setPendingAction,
  addToolResult
}: MessageProps) {
  const { config } = useChatConfig();

  const isAssistant = message.role === 'assistant';
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
                    <MarkdownMessage content={part.text} />
                  </div>
                );
            }
          })}
        </div>
      </div>
    );
  }

  const toolCalls = message.parts?.filter((part) => part.type === 'tool-invocation');
  const textParts = message.parts?.filter((part) => part.type === 'text');

  return (
    <div className={cn('flex w-full flex-col justify-start gap-2', config.messageStyles.container)}>
      {toolCalls && toolCalls.length > 0 && (
        <>
          {toolCalls.map((toolCall, index) => (
            <ToolCallIndicator
              key={index}
              toolName={toolCall.toolInvocation.toolName}
              state={toolCall.toolInvocation.state}
              args={toolCall.toolInvocation.args}
            />
          ))}
        </>
      )}

      {textParts && textParts.length > 0 && (
        <div
          className={cn(
            'flex max-w-[90%] flex-col gap-2',
            isAssistant && config.messageStyles.assistant
          )}>
          {textParts?.map((part, index) => {
            switch (part.type) {
              case 'text':
                return (
                  <div key={index}>
                    <MarkdownMessage content={part.text} />
                  </div>
                );
              // TODO: Can use this to show user dependent tool invocations & responses
              // case 'tool-invocation':
              //   switch (part.toolInvocation.toolName) {
              //     case CHAT_TOOLS.CREATE_PERSON:
              //       return (
              //         <div
              //           key={part.toolInvocation.toolCallId}
              //           className={'ro unded-sm max-w-[90%] break-words bg-muted px-3 py-2 text-sm'}>
              //           <ActionCard
              //             person={part.toolInvocation.args}
              //             completed={part.toolInvocation.state === 'result'}
              //             pendingAction={pendingActions.find((action: PendingAction) => action.toolCallId === part.toolInvocation.toolCallId)}
              //             setPendingAction={setPendingAction}
              //             addToolResult={addToolResult}
              //           />
              //         </div>
              //       );
              //   }
            }
          })}
        </div>
      )}
    </div>
  );
}
