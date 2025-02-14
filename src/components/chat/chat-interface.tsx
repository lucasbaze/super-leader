'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useChat } from 'ai/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useMessages } from '@/hooks/use-messages';
import { useCreatePerson } from '@/hooks/use-people';
import { usePerson } from '@/hooks/use-person';
import { useCreateInteraction } from '@/hooks/use-person-activity';
import { useUpdateSuggestion } from '@/hooks/use-suggestions';
import { MESSAGE_ROLE, MESSAGE_TYPE } from '@/lib/messages/constants';
import { CHAT_TOOLS } from '@/lib/tools/chat-tools';
import { TChatMessage } from '@/services/messages/create-message';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';

const initialMessage = {
  id: 'loading-1',
  role: MESSAGE_ROLE.ASSISTANT,
  content: 'Fetching previous messages...'
};

export function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [localMessages, setLocalMessages] = useState<TChatMessage['message'][]>([initialMessage]);
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    name: string;
    arguments: any;
    toolCallId: string;
  } | null>(null);
  const params = useParams();
  const router = useRouter();
  const { data: personData } = usePerson(params.id as string);

  const { messages, input, handleInputChange, handleSubmit, isLoading, addToolResult, append } =
    useChat({
      api: '/api/chat',
      initialMessages: localMessages,
      id: initialMessage.id,
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
      onFinish: async ({ content, data, toolInvocations }) => {
        console.log('Chat Interface: onFinish:', { content, data, toolInvocations });
      }
    });

  const createPerson = useCreatePerson();
  const createInteraction = useCreateInteraction(pendingAction?.arguments?.person_id || params.id);
  const updateSuggestion = useUpdateSuggestion();

  const {
    data: messagesData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  } = useMessages({
    type: params.id ? MESSAGE_TYPE.PERSON : MESSAGE_TYPE.HOME,
    personId: params.id as string,
    limit: 10
  });
  console.log('messagesData', messagesData);
  // Fetch saved messages
  useEffect(() => {
    // @ts-ignore
    if (messagesData && messagesData.messages.length) {
      // @ts-ignore
      const messageContent = messagesData.messages
        .map((message: TChatMessage) => message.message)
        .filter((message: TChatMessage['message']) => typeof message.content === 'string');
      console.log('messageContent', messageContent);
      const newMessages = [...localMessages, ...messageContent];
      console.log('newMessages', newMessages);
      setLocalMessages(newMessages);
      if (messagesEndRef.current && autoScroll) {
        messagesEndRef.current.scrollIntoView();
      }
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
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
