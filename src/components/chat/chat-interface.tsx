'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Message } from 'ai';
import { useChat } from 'ai/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useCreateMessage, useMessages } from '@/hooks/use-messages';
import { useCreatePerson } from '@/hooks/use-people';
import { usePerson } from '@/hooks/use-person';
import { useCreateInteraction } from '@/hooks/use-person-activity';
import { useUpdateSuggestion } from '@/hooks/use-suggestions';
import { CHAT_TOOLS } from '@/lib/chat/chat-tools';
import { dateHandler } from '@/lib/dates/helpers';
import { $user } from '@/lib/llm/messages';
import { MESSAGE_TYPE, TMessageType } from '@/lib/messages/constants';
import { routes } from '@/lib/routes';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { getChatType } from './utils';

const getChatParams = (params: any, pathname: string) => {
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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    name: string;
    arguments: any;
    toolCallId: string;
  } | null>(null);
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const { chatType, chatId } = getChatParams(params, pathname);

  // TODO: This will have to get extended to support other chat types such a group info... possibly?
  // yeah, like know the number of people in the group or something.
  const { data: personData } = usePerson(
    chatType === MESSAGE_TYPE.PERSON ? (params.id as string) : null
  );

  const createPerson = useCreatePerson();
  const createInteraction = useCreateInteraction(pendingAction?.arguments?.person_id || params.id);
  const updateSuggestion = useUpdateSuggestion();
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
      personId: params.id,
      personName: personData?.person
        ? `${personData.person.first_name} ${personData.person.last_name}`
        : undefined
    },
    onToolCall: async ({ toolCall }) => {
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
      // Save the return messsages to the database
      await createMessage.mutateAsync({
        ...getMessageParams(chatType, chatId),
        message: result
      });
    }
  });

  const {
    data: messagesData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  } = useMessages({
    ...getMessageParams(chatType, chatId),
    limit: 10
  });

  // Set saved messages
  useEffect(() => {
    // messagesData.messages comes from the useMessages hook which returns a messages array
    // @ts-ignore
    const newMessages = messagesData?.messages;
    if (!newMessages?.length) {
      // Set the default message that should be displayed to the user.
      setMessages(() => {
        return [
          {
            id: 'default',
            content: 'You are looking at your group. Let me know how I can help.',
            role: 'assistant' as const
          }
        ];
      });
      return;
    }

    setMessages((prevMessages) => {
      // Create a Map for O(1) lookups, using most recent version of each message
      const messageMap = new Map(prevMessages.map((msg) => [msg.id, msg]));

      // Update map with any new messages, automatically handling duplicates
      newMessages.forEach((msg: Message) => {
        messageMap.set(msg.id, msg);
      });

      // Convert map values back to array and sort once
      return Array.from(messageMap.values()).sort((a, b) =>
        dateHandler(a.createdAt).isBefore(dateHandler(b.createdAt)) ? -1 : 1
      );
    });
    // @ts-ignore
  }, [messagesData?.messages]);

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    try {
      if (pendingAction.name === CHAT_TOOLS.CREATE_PERSON) {
        const result = await createPerson.mutateAsync(pendingAction.arguments);
        console.log('Create Person result:', result);
        addToolResult({ toolCallId: pendingAction.toolCallId, result: 'Yes' });

        // Show toast with link to new person
        // TODO: Need to fix this, so that it's working properly
        toast.success(
          <div className='flex flex-col gap-2'>
            <p>
              Successfully created {pendingAction.arguments.first_name}{' '}
              {pendingAction.arguments.last_name}
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push(routes.person.activity({ id: result.data?.id || '' }))}>
              View Profile
            </Button>
          </div>
        );
      } else if (pendingAction.name === CHAT_TOOLS.CREATE_INTERACTION) {
        const result = await createInteraction.mutateAsync({
          type: pendingAction.arguments.type,
          note: pendingAction.arguments.note
        });
        console.log('Create Interaction result:', result);
        addToolResult({ toolCallId: pendingAction.toolCallId, result: 'Yes' });
      }
      setPendingAction(null);
    } catch (error) {
      console.error('Error handling action:', error);
      toast.error('Failed to create. Please try again.');
    }
  };

  const handleCancelAction = () => {
    if (!pendingAction) return;
    addToolResult({ toolCallId: pendingAction.toolCallId, result: 'Cancelled action' });
    setPendingAction(null);
  };

  // Set initial scroll position to bottom when messages first load
  useEffect(() => {
    // @ts-ignore
    if (messagesData?.messages) {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      });
    }
  }, [messagesData]);

  // Track scroll position to determine if we should auto-scroll new messages
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const isAtBottom =
        Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 10;
      setShouldAutoScroll(isAtBottom);

      // Load more messages when scrolling near top
      if (container.scrollTop < 100 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const handleSuggestionViewed = (suggestionId: string) => {
    updateSuggestion.mutate({
      suggestionId,
      viewed: true
    });
  };

  const handleSuggestionBookmark = (suggestionId: string, saved: boolean) => {
    updateSuggestion.mutate({
      suggestionId,
      saved
    });
  };

  const handleSuggestionDislike = (suggestionId: string, bad: boolean) => {
    updateSuggestion.mutate({
      suggestionId,
      bad
    });
  };

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
        <ChatMessages
          ref={messagesContainerRef}
          messages={messages}
          isLoading={isLoading}
          handleConfirmAction={handleConfirmAction}
          handleCancelAction={handleCancelAction}
          append={append}
          onScroll={handleScroll}
          messagesEndRef={messagesEndRef}
          onSuggestionViewed={handleSuggestionViewed}
          onSuggestionBookmark={handleSuggestionBookmark}
          onSuggestionDislike={handleSuggestionDislike}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          hasMore={hasNextPage || false}
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
