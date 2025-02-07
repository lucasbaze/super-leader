'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useChat } from 'ai/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useCreatePerson } from '@/hooks/use-people';
import { useCreateInteraction } from '@/hooks/use-person-activity';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';

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
  const router = useRouter();

  const { messages, input, handleInputChange, handleSubmit, isLoading, addToolResult, append } =
    useChat({
      api: '/api/chat',
      initialMessages: [
        {
          role: 'assistant',
          content: 'Hello, how can I help you today?',
          id: '1'
        }
      ],
      onToolCall: async ({ toolCall }) => {
        if (toolCall.toolName === 'getPersonSuggestions') {
          console.log('getPersonSuggestions', toolCall);
          return;
        }
        setPendingAction({
          type: 'function',
          name: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          arguments: toolCall.args
        });
      }
    });

  const createPerson = useCreatePerson();
  const createInteraction = useCreateInteraction(pendingAction?.arguments?.person_id || params.id);

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    try {
      if (pendingAction.name === 'createPerson') {
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
      } else if (pendingAction.name === 'createInteraction') {
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

  const handleHeaderAction = (message: string) => {
    handleInputChange({
      target: { value: message }
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>);
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

  return (
    <div className='absolute inset-0 flex flex-col'>
      <ChatHeader onAction={handleHeaderAction} append={append} />
      <div className='relative flex-1 overflow-hidden'>
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          handleConfirmAction={handleConfirmAction}
          handleCancelAction={handleCancelAction}
          append={append}
          onScroll={handleScroll}
          messagesEndRef={messagesEndRef}
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
