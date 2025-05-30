import { forwardRef } from 'react';

import { CreateMessage, Message } from 'ai';

import { PulseLoader } from '@/components/animated/pulse-loader';
import { Loader } from '@/components/icons';
import type { PendingAction } from '@/hooks/chat/use-chat-interface';

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
    { messages, pendingAction, setPendingAction, addToolResult, append, isLoading, isLoadingConversations, ...props },
    ref
  ) => {
    return (
      <div ref={ref} className='absolute inset-0 overflow-y-auto p-4' onScroll={props.onScroll}>
        <div className='flex flex-col gap-2'>
          {/* Loading indicator */}
          {props.hasMore && (
            <div className='flex justify-center py-2'>
              {props.isFetchingNextPage && <Loader className='size-6 animate-spin text-muted-foreground' />}
            </div>
          )}

          {messages.map((message, index) => {
            const isLastMessage = index === messages.length - 1;
            return (
              <>
                <MainMessage
                  key={message.id || index}
                  message={message}
                  isLastMessage={isLastMessage}
                  isLoading={isLoading}
                  pendingAction={pendingAction}
                  setPendingAction={setPendingAction}
                  addToolResult={addToolResult}
                  append={append}
                />
                {isLastMessage && isLoading && <PulseLoader size={20} />}
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
