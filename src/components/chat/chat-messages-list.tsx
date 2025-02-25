import { forwardRef } from 'react';

import { CreateMessage, Message } from 'ai';

import { Loader } from '@/components/icons';
import type { PendingAction } from '@/hooks/use-chat-interface';

import { ChatMessage } from './messages/chat-message';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  pendingAction: PendingAction;
  setPendingAction: (action: PendingAction) => void;
  append: (message: CreateMessage) => void;
  addToolResult: (result: { toolCallId: string; result: string }) => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasMore: boolean;
}

export const ChatMessagesList = forwardRef<HTMLDivElement, ChatMessagesProps>(
  (
    { messages, pendingAction, setPendingAction, addToolResult, append, isLoading, ...props },
    ref
  ) => {
    return (
      <div ref={ref} className='absolute inset-0 overflow-y-auto p-4' onScroll={props.onScroll}>
        <div className='flex flex-col gap-4'>
          {/* Loading indicator */}
          {props.hasMore && (
            <div className='flex justify-center py-2'>
              {props.isFetchingNextPage && (
                <Loader className='size-6 animate-spin text-muted-foreground' />
              )}
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage
              key={message.id || index}
              message={message}
              isLastMessage={index === messages.length - 1}
              containerRef={ref}
              pendingAction={pendingAction}
              setPendingAction={setPendingAction}
              addToolResult={addToolResult}
              append={append}
              isLoading={isLoading}
            />
          ))}
          <div ref={props.messagesEndRef} />
        </div>
      </div>
    );
  }
);

ChatMessagesList.displayName = 'ChatMessagesList';
