'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { Message, ToolCall } from 'ai';
import { useChat } from 'ai/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useCreateMessage, useMessages } from '@/hooks/use-messages';
import { useCreatePerson } from '@/hooks/use-people';
import { usePerson } from '@/hooks/use-person';
import { useCreateInteraction } from '@/hooks/use-person-activity';
import { useSavedMessages } from '@/hooks/use-saved-messages';
import { useUpdateSuggestion } from '@/hooks/use-suggestions';
import { CHAT_TOOLS, ChatTools } from '@/lib/chat/chat-tools';
import { dateHandler } from '@/lib/dates/helpers';
import { $user } from '@/lib/llm/messages';
import { MESSAGE_TYPE, TMessageType } from '@/lib/messages/constants';
import { routes } from '@/lib/routes';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessagesList } from './chat-messages-list';
import { getChatType } from './utils';

const useChatParams = (params: any, pathname: string) => {
  const { type, id } = getChatType(pathname, params.id);
  return { chatType: type, chatId: id };
};

const getMessageParams = (type: TMessageType, id: string) => {
  if (type === MESSAGE_TYPE.PERSON) {
    return {
      type,
      personId: id
    };
  } else if (type === MESSAGE_TYPE.GROUP) {
    return {
      type,
      groupId: id
    };
  } else {
    return {
      type
    };
  }
};

export function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const queryClient = useQueryClient();
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    name: string;
    arguments: any;
    toolCallId: string;
  } | null>(null);
  const [toolsCalled, setToolsCalled] = useState<ToolCall<string, unknown>[]>([]);
  const [chatFinished, setChatFinished] = useState(false);
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { chatType, chatId } = useChatParams(params, pathname);

  // TODO: This will have to get extended to support other chat types such a group info... possibly?
  // yeah, like know the number of people in the group or something.
  const { data: personData } = usePerson(
    chatType === MESSAGE_TYPE.PERSON ? (params.id as string) : null
  );

  const createPerson = useCreatePerson();
  const createInteraction = useCreateInteraction(pendingAction?.arguments?.person_id || params.id);
  const createMessage = useCreateMessage();

  const {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    isLoading,
    addToolResult,
    append
  } = useChat({
    api: '/api/chat',
    initialMessages: [],
    id: chatId,
    body: {
      ...(chatType == MESSAGE_TYPE.PERSON && { personId: params.id }),
      ...(chatType == MESSAGE_TYPE.GROUP && { groupId: params.id }),
      ...(personData?.person && {
        personName: `${personData.person.first_name} ${personData.person.last_name}`
      })
    },
    onError: (error) => {
      setMessages((messages) => [
        ...messages,
        {
          id: 'error',
          role: 'assistant',
          content: 'Hmm... An error occurred. Please try again.',
          error: error
        }
      ]);
    },
    onToolCall: async ({ toolCall }) => {
      console.log('Tool Called:', toolCall);
      setToolsCalled((prevActions) => {
        const tool = ChatTools.get(toolCall.toolName);
        console.log('Tool:', tool);
        const shouldCallEachTime = tool?.onSuccessEach ?? false;
        console.log('Should Call Each Time:', shouldCallEachTime);
        console.log('Prev Actions:', prevActions);
        console.log(
          'Array checks: ',
          Array.isArray(prevActions),
          prevActions.some((call) => call.toolName === toolCall.toolName)
        );
        // If we should call for each instance, or if the tool hasn't been called yet
        if (
          shouldCallEachTime ||
          !prevActions.some((call) => call.toolName === toolCall.toolName)
        ) {
          console.log('Adding tool call:', toolCall);
          return [...prevActions, toolCall];
        }

        return prevActions;
      });
      // Need to handle the tool call for creating messages as well
      if (toolCall.toolName === CHAT_TOOLS.GET_PERSON_SUGGESTIONS) {
        console.log('getPersonSuggestions', toolCall);
        return;
      }
      setPendingAction({
        type: 'function',
        name: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        arguments: toolCall.args
      });
    },
    onFinish: async (result) => {
      setChatFinished(true);

      // Save the final result message
      await createMessage.mutateAsync({
        ...getMessageParams(chatType, chatId),
        message: result
      });
    }
  });

  useEffect(() => {
    if (chatFinished && toolsCalled.length > 0) {
      toolsCalled.forEach((toolCall) => {
        const tool = ChatTools.get(toolCall.toolName);
        if (tool?.onSuccess) {
          tool.onSuccess({ queryClient, args: toolCall.args });
        }
      });

      const saveAllMessages = async (messagesToSave: (Message | undefined)[]) => {
        if (!messagesToSave) return;
        await Promise.all(
          messagesToSave.map((msg) => {
            if (!msg) return;
            return createMessage.mutateAsync({
              ...getMessageParams(chatType, chatId),
              message: msg
            });
          })
        );
      };
      // Save all unsaved messages
      // Get all unsaved messages that need to be persisted
      const messagesToSave = toolsCalled.map((tool) =>
        messages.find((msg) =>
          msg.toolInvocations?.some((invocation) => invocation.toolCallId === tool.toolCallId)
        )
      );
      console.log('messagesToSave', messagesToSave);

      // Save all unsaved messages
      saveAllMessages(messagesToSave);

      // Reset states
      setToolsCalled([]);
      setChatFinished(false);
    }
  }, [chatFinished, toolsCalled, queryClient, messages]);

  const { savedMessagesData, fetchNextPage, isFetchingNextPage, hasNextPage } = useSavedMessages({
    chatType,
    chatId,
    pathname,
    setMessages
  });

  // Set initial scroll position to bottom when first loading messages
  useEffect(() => {
    // @ts-ignore
    if (savedMessagesData?.messages) {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      });
    }
  }, [savedMessagesData]);

  // Track scroll position to determine if we should auto-scroll new messages
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const isAtBottom =
        Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 10;
      setShouldAutoScroll(isAtBottom);

      // Load more messages when scrolling near top
      if (container.scrollTop < 400 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim()) return;

      // Clear input and append message to UI
      const messageContent = input;
      setInput('');

      await createMessage.mutateAsync({
        ...getMessageParams(chatType, chatId),
        message: $user(messageContent)
      });

      // Send message to AI
      // TODO: Why does $user(messageContent) throw a type error?
      await append({
        content: messageContent,
        role: 'user'
      });
    },
    [append, chatType, chatId, createMessage, input, setInput]
  );

  return (
    <div className='absolute inset-0 flex flex-col'>
      <ChatHeader append={append} />
      <div className='relative flex-1 overflow-hidden'>
        <ChatMessagesList
          ref={messagesContainerRef}
          messages={messages}
          isLoading={isLoading}
          append={append}
          onScroll={handleScroll}
          messagesEndRef={messagesEndRef}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          hasMore={hasNextPage || false}
          pendingAction={pendingAction}
          setPendingAction={setPendingAction}
          addToolResult={addToolResult}
        />
      </div>
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading || createPerson.isPending || createInteraction.isPending}
      />
    </div>
  );
}
