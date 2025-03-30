import { forwardRef } from 'react';

import { CreateMessage, Message } from 'ai';

import { Loader } from '@/components/icons';
import type { PendingAction } from '@/hooks/chat/use-chat-interface';

import { ChatMessage } from '../messages/chat-message';
import { MainMessage } from './main-message';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isLoadingConversations: boolean;
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

export const MainMessagesList = forwardRef<HTMLDivElement, ChatMessagesProps>(
  (
    {
      messages,
      pendingAction,
      setPendingAction,
      addToolResult,
      append,
      isLoading,
      isLoadingConversations,
      ...props
    },
    ref
  ) => {
    // console.log('messages', messages);
    return (
      <div ref={ref} className='absolute inset-0 overflow-y-auto p-4' onScroll={props.onScroll}>
        <div className='flex flex-col gap-2'>
          {/* Loading indicator */}
          {props.hasMore && (
            <div className='flex justify-center py-2'>
              {props.isFetchingNextPage && (
                <Loader className='size-6 animate-spin text-muted-foreground' />
              )}
            </div>
          )}

          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            return (
              <>
                {/* <ChatMessage
                  key={message.id || index}
                  message={message}
                  isLastMessage={isLastMessage}
                  containerRef={ref}
                  pendingAction={pendingAction}
                  setPendingAction={setPendingAction}
                  addToolResult={addToolResult}
                  append={append}
                  isLoading={isLoading}
                /> */}
                <MainMessage
                  key={message.id || index}
                  message={message}
                  isLastMessage={isLastMessage}
                  isLoading={isLoading}
                  pendingAction={pendingAction}
                  setPendingAction={setPendingAction}
                  addToolResult={addToolResult}
                  append={append}
                  // containerRef={ref}
                  // pendingAction={pendingAction}
                />
                {isLastMessage && isLoading && <Loader className='size-4 animate-spin' />}
              </>
            );
          })}
          <div ref={props.messagesEndRef} />
        </div>
      </div>
    );
  }
);

MainMessagesList.displayName = 'MainMessagesList';
