'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CreateMessage, useChat } from 'ai/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useCreateMessage, useMessages } from '@/hooks/use-messages';
import { useCreatePerson } from '@/hooks/use-people';
import { usePerson } from '@/hooks/use-person';
import { useCreateInteraction } from '@/hooks/use-person-activity';
import { useUpdateSuggestion } from '@/hooks/use-suggestions';
import { $user } from '@/lib/llm/messages';
import { MESSAGE_ROLE, MESSAGE_TYPE, TMessageType } from '@/lib/messages/constants';
import { CHAT_TOOLS } from '@/lib/tools/chat-tools';
import { TChatMessage } from '@/services/messages/create-message';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';

const getChatParams = (params: any, pathname: string) => {
  let chatType: TMessageType = MESSAGE_TYPE.HOME;
  let chatId = 'home';

  if (pathname.includes('/app/person/')) {
    chatType = MESSAGE_TYPE.PERSON;
    chatId = params.id as string;
  } else if (pathname.includes('/app/groups/')) {
    chatType = MESSAGE_TYPE.GROUP;
    chatId = params.slug as string;
  } else if (pathname.includes('/app/network/')) {
    chatType = MESSAGE_TYPE.NETWORK;
    chatId = 'network';
  } else if (pathname.includes('/app/people/')) {
    chatType = MESSAGE_TYPE.PEOPLE;
    chatId = 'people';
  }

  return { chatType, chatId };
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
  const [autoScroll, setAutoScroll] = useState(true);
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

  const { data: personData } = usePerson(params.id as string);

  const createPerson = useCreatePerson();
  const createInteraction = useCreateInteraction(pendingAction?.arguments?.person_id || params.id);
  const updateSuggestion = useUpdateSuggestion();
  const createMessage = useCreateMessage();

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    isLoading,
    addToolResult,
    append,
    setMessages
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
        type: chatType,
        personId: params.id as string,
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
  console.log('messagesData', messagesData);

  // Fetch saved messages
  useEffect(() => {
    // @ts-ignore
    if (messagesData && messagesData.messages.length) {
      // @ts-ignore
      setMessages(messagesData.messages);

      // @ts-ignore
      // const messageContent = messagesData.messages
      //   .map((message: TChatMessage) => message.message)
      //   .filter((message: TChatMessage['message']) => typeof message.content === 'string');
      // console.log('messageContent', messageContent);
      // const newMessages = [...localMessages, ...messageContent];
      // console.log('newMessages', newMessages);
      // setLocalMessages(newMessages);
      // if (messagesEndRef.current && autoScroll) {
      //   messagesEndRef.current.scrollIntoView();
      // }
    }
  }, [messagesData]);

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
              onClick={() => router.push(`/app/person/${result.data?.id}/activity`)}>
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

  const scrollToBottom = () => {
    if (messagesEndRef.current && autoScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll when new messages arrive
  // useEffect(() => {
  //   scrollToBottom();
  // }, [messages]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Clear input and append message to UI
    const messageContent = input;
    setInput('');

    // TODO: Make sure that we handle the other types of messages
    await createMessage.mutateAsync({
      type: chatType,
      personId: params.id as string,
      message: $user(messageContent)
    });

    // Send message to AI
    await append({
      content: messageContent,
      role: 'user'
    });
  };

  return (
    <div className='absolute inset-0 flex flex-col'>
      <ChatHeader append={append} />
      <div className='relative flex-1 overflow-hidden'>
        <ChatMessages
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
