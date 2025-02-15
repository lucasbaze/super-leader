import { forwardRef } from 'react';

import { CreateMessage, Message } from 'ai';
import { Loader2 } from 'lucide-react';

import { ChatMessage } from './messages/chat-message';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  handleConfirmAction: () => void;
  handleCancelAction: () => void;
  append: (message: CreateMessage) => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onSuggestionViewed: (suggestionId: string) => void;
  onSuggestionBookmark: (suggestionId: string, saved: boolean) => void;
  onSuggestionDislike: (suggestionId: string, bad: boolean) => void;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasMore: boolean;
}

export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  (
    {
      messages,
      isLoading,
      handleConfirmAction,
      handleCancelAction,
      append,
      onScroll,
      messagesEndRef,
      onSuggestionViewed,
      onSuggestionBookmark,
      onSuggestionDislike,
      isFetchingNextPage,
      hasMore
    },
    ref
  ) => {
    return (
      <div ref={ref} className='absolute inset-0 overflow-y-auto p-4' onScroll={onScroll}>
        <div className='flex flex-col gap-4'>
          {/* Loading more indicator */}
          {hasMore && (
            <div className='flex justify-center py-2'>
              {isFetchingNextPage && (
                <Loader2 className='size-6 animate-spin text-muted-foreground' />
              )}
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage
              key={message.id || index}
              message={message}
              handleConfirmAction={handleConfirmAction}
              handleCancelAction={handleCancelAction}
              append={append}
              onSuggestionViewed={onSuggestionViewed}
              onSuggestionBookmark={onSuggestionBookmark}
              onSuggestionDislike={onSuggestionDislike}
            />
          ))}
          {isLoading && (
            <div className='min flex max-w-[90%] flex-col gap-2 rounded-lg bg-muted px-3 py-2 text-sm'>
              Thinking...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';
