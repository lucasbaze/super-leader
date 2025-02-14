import { useEffect } from 'react';

import { CreateMessage, Message } from 'ai';
import { Loader2 } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { CHAT_TOOLS } from '@/lib/tools/chat-tools';
import { cn } from '@/lib/utils';
import {
  TContentSuggestionWithId,
  TGetContentSuggestionsForPersonResponse,
  TMessageSuggestion
} from '@/services/suggestions/types';
import { Maybe } from '@/types/utils';

import { ActionCard } from './cards/action-card';
import { MessageCard } from './cards/message-card';
import { SuggestionCard } from './cards/suggestion-card';
import { ToolErrorCard } from './cards/tool-error-card';

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

// Open-router may return an array of objects for the content when invoking tools
// This allows us to save the raw content directly and then
const getMessageContent = (message: Message) => {
  const content = message.content;
  if (typeof message.content === 'string') {
    return message.content;
  } else if (Array.isArray(content)) {
    return content[0].text;
  } else {
    console.log('Unexpected value type');
  }
};
export function ChatMessages({
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
  fetchNextPage,
  isFetchingNextPage,
  hasMore
}: ChatMessagesProps) {
  // Set up intersection observer for infinite scroll
  // const { ref: loadMoreRef, inView } = useInView();

  // Trigger next page fetch when load more element comes into view
  // useEffect(() => {
  //   if (inView && hasMore) {
  //     fetchNextPage();
  //   }
  // }, [inView, hasMore, fetchNextPage]);

  return (
    <div className='absolute inset-0 overflow-y-auto p-4' onScroll={onScroll}>
      <div className='flex flex-col gap-4'>
        {/* Loading more indicator */}
        {/* {hasMore && (
          <div ref={loadMoreRef} className='flex justify-center py-2'>
            {isFetchingNextPage && (
              <Loader2 className='size-6 animate-spin text-muted-foreground' />
            )}
          </div>
        )} */}

        {messages.map((message, index) => {
          if (message.role === 'user') {
            return (
              <div key={message.id} className='flex flex-col items-end gap-2'>
                <div className='max-w-[90%] break-words rounded-sm bg-primary px-3 py-2 text-sm text-primary-foreground'>
                  {message.content}
                </div>
              </div>
            );
          }

          if (message.role === 'assistant') {
            const messageContent = getMessageContent(message);
            const content = messageContent !== '' && (
              <div className={'max-w-[90%] break-words rounded-sm bg-muted px-3 py-2 text-sm'}>
                <ReactMarkdown
                  components={{
                    // Style different markdown elements
                    p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
                    code: ({ node, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');

                      return match ? (
                        <SyntaxHighlighter
                          // @ts-ignore
                          style={dark}
                          language={match[1]}
                          PreTag='div'
                          className='rounded-md'
                          {...props}>
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className={cn(
                            'bg-muted-foreground/20 rounded px-1.5 py-0.5 font-mono text-sm',
                            className
                          )}
                          {...props}>
                          {children}
                        </code>
                      );
                    },
                    ul: ({ children }) => (
                      <ul className='mb-2 list-disc pl-4 last:mb-0'>{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className='mb-2 list-decimal pl-4 last:mb-0'>{children}</ol>
                    ),
                    li: ({ children }) => <li className='mb-1 last:mb-0'>{children}</li>,
                    h3: ({ children }) => (
                      <h3 className='mb-2 text-base font-medium last:mb-0'>{children}</h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className='mb-2 text-sm font-medium last:mb-0'>{children}</h4>
                    )
                  }}>
                  {message.content}
                </ReactMarkdown>
              </div>
            );
            const toolInvocations = message.toolInvocations?.map((toolInvocation) => {
              // Handle tool errors first
              if (toolInvocation.state === 'result' && toolInvocation.result.error) {
                return (
                  <ToolErrorCard
                    key={toolInvocation.toolCallId}
                    message={toolInvocation.result.message}
                    errorDetails={toolInvocation.result.details}
                    toolName={toolInvocation.toolName}
                  />
                );
              }

              // Handle successful tool invocations
              if (toolInvocation.toolName === CHAT_TOOLS.CREATE_PERSON) {
                return (
                  <div
                    key={toolInvocation.toolCallId}
                    className={'max-w-[90%] break-words rounded-sm bg-muted px-3 py-2 text-sm'}>
                    <ActionCard
                      person={toolInvocation.args}
                      onConfirm={handleConfirmAction}
                      onCancel={handleCancelAction}
                      completed={toolInvocation.state === 'result'}
                    />
                  </div>
                );
              }
              if (toolInvocation.toolName === CHAT_TOOLS.GET_PERSON_SUGGESTIONS) {
                // console.log('toolInvocation', toolInvocation);
                const result =
                  // @ts-ignore
                  toolInvocation.result as Maybe<TGetContentSuggestionsForPersonResponse>;
                const suggestions = result?.suggestions;
                if (!suggestions) return null;
                return (
                  <>
                    {suggestions.map((suggestion: TContentSuggestionWithId, index: number) => (
                      <SuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        append={append}
                        onViewed={onSuggestionViewed}
                        onBookmark={onSuggestionBookmark}
                        onDislike={onSuggestionDislike}
                      />
                    ))}
                  </>
                );
              }
              if (toolInvocation.toolName === CHAT_TOOLS.CREATE_INTERACTION) {
                return (
                  <div
                    key={toolInvocation.toolCallId}
                    className={'max-w-[90%] break-words text-sm'}>
                    <ActionCard
                      interaction={toolInvocation.args}
                      onConfirm={handleConfirmAction}
                      onCancel={handleCancelAction}
                      completed={
                        // @ts-ignore TODO: Update types for toolInvocations
                        toolInvocation.state === 'result' || toolInvocation.result === 'unknown'
                      }
                    />
                  </div>
                );
              }
              if (toolInvocation.toolName === CHAT_TOOLS.CREATE_MESSAGE_SUGGESTIONS) {
                return (
                  <>
                    {/* @ts-ignore */}
                    {toolInvocation.result?.map((result: TMessageSuggestion, index: number) => (
                      <MessageCard
                        key={index}
                        message={result.text}
                        tone={result.tone}
                        // TODO: Add url passed from state
                        // url={result.url}
                      />
                    ))}
                  </>
                );
              }
            });
            return (
              <div key={message.id || index} className='flex flex-col items-start gap-2'>
                {content}
                {toolInvocations}
              </div>
            );
          }
        })}
        {isLoading && (
          <div className='flex max-w-[90%] flex-col gap-2 rounded-lg bg-muted px-3 py-2 text-sm'>
            Thinking...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
