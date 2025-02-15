import { CreateMessage, Message } from 'ai';
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

import { ActionCard } from '../cards/action-card';
import { MessageCard } from '../cards/message-card';
import { SuggestionCard } from '../cards/suggestion-card';
import { ToolErrorCard } from '../cards/tool-error-card';

interface ChatMessageProps {
  message: Message;
  handleConfirmAction: () => void;
  handleCancelAction: () => void;
  append: (message: CreateMessage) => void;
  onSuggestionViewed: (suggestionId: string) => void;
  onSuggestionBookmark: (suggestionId: string, saved: boolean) => void;
  onSuggestionDislike: (suggestionId: string, bad: boolean) => void;
}

// Helper function moved from chat-messages.tsx
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

export function ChatMessage({
  message,
  handleConfirmAction,
  handleCancelAction,
  append,
  onSuggestionViewed,
  onSuggestionBookmark,
  onSuggestionDislike
}: ChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div className='flex flex-col items-end gap-2'>
        <div className='max-w-[90%] break-words rounded-sm bg-gradient-to-r from-primary to-blue-500 px-3 py-2 text-sm text-primary-foreground'>
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
            ul: ({ children }) => <ul className='mb-2 list-disc pl-4 last:mb-0'>{children}</ul>,
            ol: ({ children }) => <ol className='mb-2 list-decimal pl-4 last:mb-0'>{children}</ol>,
            li: ({ children }) => <li className='mb-1 last:mb-0'>{children}</li>,
            h3: ({ children }) => (
              <h3 className='mb-2 text-base font-medium last:mb-0'>{children}</h3>
            ),
            h4: ({ children }) => <h4 className='mb-2 text-sm font-medium last:mb-0'>{children}</h4>
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
        // @ts-expect-error
        const result = toolInvocation.result as Maybe<TGetContentSuggestionsForPersonResponse>;
        const suggestions = result?.suggestions;
        if (!suggestions) return null;
        return (
          <>
            {suggestions.map((suggestion: TContentSuggestionWithId) => (
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
          <div key={toolInvocation.toolCallId} className={'max-w-[90%] break-words text-sm'}>
            <ActionCard
              interaction={toolInvocation.args}
              onConfirm={handleConfirmAction}
              onCancel={handleCancelAction}
              // @ts-expect-error
              completed={toolInvocation.state === 'result' || toolInvocation.result === 'unknown'}
            />
          </div>
        );
      }
      if (toolInvocation.toolName === CHAT_TOOLS.CREATE_MESSAGE_SUGGESTIONS) {
        return (
          <>
            {/* @ts-ignore */}
            {toolInvocation.result?.map((result: TMessageSuggestion, index: number) => (
              <MessageCard key={index} message={result.text} tone={result.tone} />
            ))}
          </>
        );
      }
    });

    return (
      <div className='flex flex-col items-start gap-2'>
        {content}
        {toolInvocations}
      </div>
    );
  }
}
