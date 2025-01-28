'use client';

import { cn } from '@/lib/utils';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessages } from './chat-messages';
import { useChat } from 'ai/react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat'
  });

  return (
    <div className='relative h-full'>
      <div className='absolute inset-0 flex flex-col'>
        <ChatHeader />
        <div className='relative flex-1 overflow-hidden'>
          <ChatMessages messages={messages} isLoading={isLoading} />
        </div>
        <ChatInput
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
