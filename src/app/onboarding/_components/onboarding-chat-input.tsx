'use client';

import { useState } from 'react';

import { Send } from '@/components/icons';
import { useChatConfig } from '@/lib/chat/chat-context';
import { cn } from '@/lib/utils';

interface OnboardingChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function OnboardingChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading
}: OnboardingChatInputProps) {
  const { config } = useChatConfig();

  return (
    <div className='ml-auto max-w-[60%]'>
      <form onSubmit={handleSubmit} className='relative flex items-center'>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder='Type your message...'
          className={cn(
            'w-full rounded-lg border p-4 pr-12',
            'bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            config.messageStyles.user
          )}
          disabled={isLoading}
        />
        <button
          type='submit'
          disabled={isLoading || !input.trim()}
          className={cn(
            'absolute right-2 rounded-md p-2',
            'text-muted-foreground hover:text-foreground',
            'disabled:opacity-50'
          )}>
          <Send className='size-5' />
        </button>
      </form>
    </div>
  );
}
