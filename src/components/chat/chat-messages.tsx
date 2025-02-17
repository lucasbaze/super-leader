import { forwardRef } from 'react';

import { CreateMessage, Message } from 'ai';

import { Loader } from '@/components/icons';

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
  ({ messages, ...props }, ref) => {
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
              {...props}
            />
          ))}
          <div ref={props.messagesEndRef} />
        </div>
      </div>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';
