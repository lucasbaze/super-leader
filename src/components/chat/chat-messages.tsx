import { cn } from '@/lib/utils';

import { Message } from 'ai';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className='flex-1 overflow-y-auto p-4'>
      <div className='flex flex-col gap-4'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
              message.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'
            )}>
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className='flex w-max max-w-[80%] flex-col gap-2 rounded-lg bg-muted px-3 py-2 text-sm'>Thinking...</div>
        )}
      </div>
    </div>
  );
}
