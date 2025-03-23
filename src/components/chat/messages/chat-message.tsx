import { useEffect, useRef } from 'react';

import { CreateMessage, Message } from 'ai';

import { PendingAction } from '@/hooks/chat/use-chat-interface';
import { CHAT_TOOLS } from '@/lib/chat/tools/constants';
import { TContextMessage } from '@/services/context/generate-initial-context-message';

import { ActionCard } from '../cards/action-card';
import { ContextMessageCard } from '../cards/context-message-card';
import { MessageCard } from '../cards/message-card';
import { SuggestionCard } from '../cards/suggestion-card';
import { ToolErrorCard } from '../cards/tool-error-card';
import { MarkdownMessage } from './markdown-message';
import { ToolCallIndicator } from './tool-call-indicator';

interface ChatMessageProps {
  message: Message;
  isLoading: boolean;
  isLastMessage: boolean;
  containerRef: React.ForwardedRef<HTMLDivElement>;
  append: (message: CreateMessage) => void;
  pendingAction: PendingAction;
  setPendingAction: (action: PendingAction) => void;
  addToolResult: (result: { toolCallId: string; result: string }) => void;
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
  isLoading,
  isLastMessage,
  containerRef,
  append,
  pendingAction,
  setPendingAction,
  addToolResult
}: ChatMessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);

  // Scroll user's message to top when it's the last message
  useEffect(() => {
    // @ts-ignore
    if (isLoading && messageRef.current && containerRef?.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    // TODO: add isLastMessage?
  }, [isLoading]);

  if (message.role === 'user') {
    return (
      <div ref={messageRef} className='flex flex-col items-end gap-2'>
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
        <MarkdownMessage content={messageContent} />
      </div>
    );

    const toolCallIndicators = message.toolInvocations?.map((toolInvocation) => (
      <ToolCallIndicator
        key={toolInvocation.toolCallId}
        toolName={toolInvocation.toolName}
        state={toolInvocation.state}
        args={toolInvocation.args}
      />
    ));

    const toolInvocations = message.toolInvocations?.map((toolInvocation) => {
      // Handle tool errors first
      if (toolInvocation.state === 'result' && toolInvocation.result?.error) {
        return (
          <ToolErrorCard
            key={toolInvocation.toolCallId}
            message={toolInvocation.result.message}
            errorDetails={toolInvocation.result.details}
            toolName={toolInvocation.toolName}
          />
        );
      }

      // Handle successful user dependent tool invocations
      if (toolInvocation.toolName === CHAT_TOOLS.CREATE_PERSON) {
        return (
          <div
            key={toolInvocation.toolCallId}
            className={'ro unded-sm max-w-[90%] break-words bg-muted px-3 py-2 text-sm'}>
            <ActionCard
              person={toolInvocation.args}
              completed={toolInvocation.state === 'result'}
              pendingAction={pendingAction}
              setPendingAction={setPendingAction}
              addToolResult={addToolResult}
            />
          </div>
        );
      }
      // Handle auto execute tool invocations (state === 'result' is required for type inference)

      // if (
      //   toolInvocation.state === 'result' &&
      //   toolInvocation.toolName === CHAT_TOOLS.INITIAL_CONTEXT_MESSAGE
      // ) {
      //   const results = toolInvocation.result?.data as TContextMessage;
      //   if (!results) return null;
      //   return (
      //     <div key={toolInvocation.toolCallId} className='flex flex-col items-start gap-2'>
      //       <ContextMessageCard
      //         initialQuestion={results.initialQuestion}
      //         followUpQuestions={results.followUpQuestions}
      //         priority={results.priority}
      //         reasoning={results.reasoning}
      //       />
      //     </div>
      //   );
      // }

      // if (
      //   toolInvocation.state === 'result' &&
      //   toolInvocation.toolName === CHAT_TOOLS.GET_PERSON_SUGGESTIONS
      // ) {
      //   const suggestions = toolInvocation.result?.suggestions;
      //   if (!suggestions) return null;
      //   return (
      //     <>
      //       {suggestions.map((suggestion: TContentSuggestionWithId) => (
      //         <SuggestionCard key={suggestion.id} suggestion={suggestion} append={append} />
      //       ))}
      //     </>
      //   );
      // }

      // if (
      //   toolInvocation.state === 'result' &&
      //   toolInvocation.toolName === CHAT_TOOLS.CREATE_MESSAGE_SUGGESTIONS
      // ) {
      //   return (
      //     <>
      //       {toolInvocation.result?.map((result: MessageSuggestion, index: number) => (
      //         <MessageCard key={index} message={result.text} tone={result.tone} />
      //       ))}
      //     </>
      //   );
      // }
    });

    return (
      <div
        ref={messageRef}
        className='flex scroll-my-14 flex-col items-start gap-2'
        // style={{ minHeight }}
      >
        {toolCallIndicators}
        {content}
        {toolInvocations}
      </div>
    );
  }
}
