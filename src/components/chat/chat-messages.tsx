import { CreateMessage, Message } from 'ai';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { cn } from '@/lib/utils';

import { ActionCard } from './cards/action-card';
import { MessageCard } from './cards/message-card';
import { SuggestionCard, TSuggestion } from './cards/suggestion-card';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  handleConfirmAction: () => void;
  handleCancelAction: () => void;
  append: (message: CreateMessage) => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({
  messages,
  isLoading,
  handleConfirmAction,
  handleCancelAction,
  append,
  onScroll,
  messagesEndRef
}: ChatMessagesProps) {
  return (
    <div className='absolute inset-0 overflow-y-auto p-4' onScroll={onScroll}>
      <div className='flex flex-col gap-4'>
        {messages.map((message) => {
          if (message.role === 'user') {
            return (
              <div key={message.id} className='ml-auto flex flex-col items-end gap-2'>
                <div className='max-w-[90%] break-words rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground'>
                  {message.content}
                </div>
              </div>
            );
          }

          if (message.role === 'assistant') {
            const content = message.content !== '' && (
              <div className={'max-w-[90%] break-words rounded-lg bg-muted px-3 py-2 text-sm'}>
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
                            'rounded bg-muted-foreground/20 px-1.5 py-0.5 font-mono text-sm',
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
              // if (toolInvocation.state === 'result') return null;
              if (toolInvocation.toolName === 'createPerson') {
                return (
                  <ActionCard
                    key={toolInvocation.toolCallId}
                    person={toolInvocation.args}
                    onConfirm={handleConfirmAction}
                    onCancel={handleCancelAction}
                    completed={toolInvocation.state === 'result'}
                  />
                );
              }
              if (toolInvocation.toolName === 'createInteraction') {
                return (
                  <ActionCard
                    key={toolInvocation.toolCallId}
                    interaction={toolInvocation.args}
                    onConfirm={handleConfirmAction}
                    onCancel={handleCancelAction}
                    completed={toolInvocation.state === 'result'}
                  />
                );
              }
              // Note: May need to conditionally check state === 'result'
              if (toolInvocation.toolName === 'getPersonSuggestions') {
                return (
                  <>
                    {/* @ts-ignore */}
                    {toolInvocation.result?.map((result: TSuggestion, index: number) => (
                      <SuggestionCard key={index} suggestion={result} append={append} />
                    ))}
                  </>
                );
              }
              if (toolInvocation.toolName === 'createMessageSuggestionsFromArticleForUser') {
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
              <div key={message.id} className='flex flex-col items-start gap-2'>
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
