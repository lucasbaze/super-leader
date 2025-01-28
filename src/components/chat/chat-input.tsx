import { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import { SendIcon } from 'lucide-react';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export function ChatInput({ input, handleInputChange, handleSubmit, isLoading }: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='border-t border-border p-4'>
      <div className='relative flex items-center'>
        <Textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder='Type a message...'
          className='min-h-[44px] w-full resize-none rounded-md pr-12'
          disabled={isLoading}
          rows={1}
        />
        <Button type='submit' size='icon' disabled={isLoading || !input.trim()} className='absolute right-1 top-1'>
          <SendIcon className='h-4 w-4' />
        </Button>
      </div>
    </form>
  );
}
