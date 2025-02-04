'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { useChat } from 'ai/react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useCreatePerson } from '@/hooks/use-people';
import { usePerson } from '@/hooks/use-person';
import { useCreateInteraction } from '@/hooks/use-person-activity';
import { fetchSuggestions } from '@/hooks/use-suggestions';
import { queryClient } from '@/lib/react-query';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { TSuggestion } from './suggestion-card';

export function ChatInterface() {
  const [pendingAction, setPendingAction] = useState<{
    type: string;
    name: string;
    arguments: any;
    toolCallId: string;
  } | null>(null);
  const params = useParams();
  const router = useRouter();
  const { data: personData } = usePerson(params.id as string);

  const { messages, input, handleInputChange, handleSubmit, isLoading, addToolResult } = useChat({
    api: '/api/chat',
    initialMessages: [
      {
        role: 'assistant',
        content: 'Hello, how can I help you today?',
        id: '1'
      }
    ],
    body: {
      personId: params.id,
      personName: personData?.person
        ? `${personData.person.first_name} ${personData.person.last_name}`
        : undefined
    },
    onToolCall: async ({ toolCall }) => {
      // TODO: Move server side tool calls to the server
      // if (toolCall.toolName === 'getPersonSuggestions') {
      //   const suggestions = await fetchSuggestions(queryClient, params.id as string);
      //   console.log('Suggestions:', suggestions, toolCall.toolCallId);
      //   addToolResult({ toolCallId: toolCall.toolCallId, result: 'Yes' });
      // }
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

  // const [suggestions, setSuggestions] = useState<TSuggestion[]>([
  //   {
  //     contentUrl: 'https://www.nasa.gov/stennis/engineering-and-test-directorate/',
  //     title: 'NASA Stennis Space Center: Propulsion Test Engineering',
  //     reason:
  //       "As a NASA scientist, Alexis might be interested in the latest developments and projects at NASA's Stennis Space Center, particularly in propulsion testing."
  //   },
  //   {
  //     contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  //     title: "Beekeeping 101: A Beginner's Guide",
  //     reason:
  //       "Given Alexis's interest in beekeeping, this video could provide her with some new insights or tips for her hobby."
  //   },
  //   {
  //     contentUrl: 'https://www.buzzfeed.com/animals/bunny-facts',
  //     title: 'Adorable Bunny Facts You Never Knew',
  //     reason:
  //       'Alexis likes bunnies, so sharing some fun and interesting facts about them could bring a smile to her face.'
  //   }
  // ]);
  const [suggestions, setSuggestions] = useState<TSuggestion[]>([]);

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
      // else if (pendingAction.name === 'getPersonSuggestions') {
      //   const suggestions = await fetchSuggestions(queryClient, params.id as string);
      //   console.log('Suggestions:', suggestions, pendingAction.toolCallId);
      //   addToolResult({
      //     toolCallId: pendingAction.toolCallId,
      //     result: ` ${JSON.stringify(suggestions)}`
      //   });
      // }
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

  const handleSuggestions = async () => {
    const message = `Get suggestions for ${personData?.person?.first_name}`;

    // Update input state first
    handleInputChange({
      target: { value: message }
    } as unknown as React.ChangeEvent<HTMLTextAreaElement>);
  };

  return (
    <div className='absolute inset-0 flex flex-col'>
      <ChatHeader onAction={handleHeaderAction} onSuggestions={handleSuggestions} />
      <div className='relative flex-1 overflow-hidden'>
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          suggestions={suggestions}
          handleConfirmAction={handleConfirmAction}
          handleCancelAction={handleCancelAction}
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
