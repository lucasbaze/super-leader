import { CreateMessage, Message } from 'ai';

import { CHAT_TOOLS } from '@/lib/chat/tools/constants';
import { cn } from '@/lib/utils';
import { Suggestion } from '@/types/custom';

import { SuggestionCard } from '../cards/suggestion-card';
import { ToolErrorCard } from '../cards/tool-error-card';
import { MarkdownMessage } from './markdown-message';

type AssistantMessageType = 'error' | 'suggestion' | 'default' | typeof CHAT_TOOLS.GET_CONTENT_SUGGESTIONS;

interface AssistantMessageRendererProps {
  message: Message;
  append: (message: CreateMessage) => void;
  messageStyles: string;
}

const getAssistantMessageType = (message: Message): AssistantMessageType => {
  const toolCalls = message.parts?.filter((part) => part.type === 'tool-invocation');

  if (
    toolCalls?.some((toolCall) => toolCall.toolInvocation.state === 'result' && toolCall.toolInvocation.result?.error)
  ) {
    return 'error';
  }

  if (toolCalls?.some((toolCall) => toolCall.toolInvocation.toolName === CHAT_TOOLS.GET_CONTENT_SUGGESTIONS)) {
    return CHAT_TOOLS.GET_CONTENT_SUGGESTIONS;
  }

  return 'default';
};

export function AssistantMessageRenderer({ message, append, messageStyles }: AssistantMessageRendererProps) {
  const messageType = getAssistantMessageType(message);
  const toolCalls = message.parts?.filter((part) => part.type === 'tool-invocation');
  const textParts = message.parts?.filter((part) => part.type === 'text');

  switch (messageType) {
    case 'error': {
      const toolCall = toolCalls?.[0];
      if (!toolCall || toolCall.toolInvocation.state !== 'result') return null;

      return (
        <ToolErrorCard
          key={toolCall.toolInvocation.toolCallId}
          message={toolCall.toolInvocation.result?.message}
          errorDetails={toolCall.toolInvocation.result?.details}
          toolName={toolCall.toolInvocation.toolName || ''}
        />
      );
    }
    // TODO: Make this case a constant
    case CHAT_TOOLS.GET_CONTENT_SUGGESTIONS: {
      const suggestions = toolCalls
        ?.filter((toolCall) => toolCall.toolInvocation.toolName === CHAT_TOOLS.GET_CONTENT_SUGGESTIONS)
        .map((toolCall) => (toolCall.toolInvocation.state === 'result' ? toolCall.toolInvocation.result : []))
        .flat()
        .filter((suggestion): suggestion is Suggestion => !!suggestion);

      if (!suggestions?.length) return null;

      return (
        <>
          {suggestions.map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
        </>
      );
    }

    case 'default':
    default: {
      return (
        <>
          {!!textParts?.length && (
            <div className={cn('flex max-w-[90%] flex-col gap-2', messageStyles)}>
              {textParts?.map((part, index) => (
                <div key={index}>
                  <MarkdownMessage content={part.text} />
                </div>
              ))}
            </div>
          )}
        </>
      );
    }
  }
}
