'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';

import { useChat } from 'ai/react';

import { useCreatePerson } from '@/hooks/use-people';
import { usePerson } from '@/hooks/use-person';
import { useCreateInteraction } from '@/hooks/use-person-activity';

import { ActionCard } from './action-card';
import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';

export function ChatInterface() {
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    name: string;
    arguments: any;
    toolCallId: string;
  } | null>(null);
  const params = useParams();
  const { data: personData } = usePerson(params.id as string);

  const { messages, input, handleInputChange, handleSubmit, isLoading, addToolResult } = useChat({
    api: '/api/chat',
    body: {
      personId: params.id,
      personName: personData?.person
        ? `${personData.person.first_name} ${personData.person.last_name}`
        : undefined
    },
    onToolCall: ({ toolCall }) => {
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
    }
  };

  const handleCancelAction = () => {
    if (!pendingAction) return;
    addToolResult({ toolCallId: pendingAction.toolCallId, result: 'No' });
    setPendingAction(null);
  };

  const handleHeaderAction = (message: string) => {
    handleInputChange({
      target: { value: message }
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>);
  };

  const handleSuggestions = async () => {
    const response = await fetch('/api/suggestions', { credentials: 'include', method: 'POST' });
    if (!response.ok) throw new Error('Failed to fetch suggestions');
    const responseData = await response.json();
    console.log('Suggestions:', responseData);

    return responseData;
  };

  return (
    <div className='absolute inset-0 flex flex-col'>
      <ChatHeader onAction={handleHeaderAction} onSuggestions={handleSuggestions} />
      <div className='relative flex-1 overflow-hidden'>
        <ChatMessages messages={messages} isLoading={isLoading} />
        {pendingAction?.name === 'createPerson' && (
          <div className='absolute inset-x-0 bottom-0 bg-background/80 p-4 backdrop-blur'>
            <ActionCard
              person={pendingAction.arguments}
              onConfirm={handleConfirmAction}
              onCancel={handleCancelAction}
            />
          </div>
        )}
        {pendingAction?.name === 'createInteraction' && (
          <div className='absolute inset-x-0 bottom-0 bg-background/80 p-4 backdrop-blur'>
            <ActionCard
              interaction={pendingAction.arguments}
              onConfirm={handleConfirmAction}
              onCancel={handleCancelAction}
            />
          </div>
        )}
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
