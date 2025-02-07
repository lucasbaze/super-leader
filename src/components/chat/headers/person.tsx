'use client';

import { useParams } from 'next/navigation';

import { ChatRequestOptions, CreateMessage, Message } from 'ai';

import { NotebookPen, Sparkles } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { usePerson } from '@/hooks/use-person';

import { DefaultChatHeader } from './default';

interface ChatHeaderProps {
  onAction: (message: string) => void;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

export function PersonChatHeader({ onAction, append }: ChatHeaderProps) {
  const params = useParams();
  const { data, isLoading } = usePerson(params.id as string);

  if (isLoading) return <DefaultChatHeader />;

  const handleSuggestions = async () => {
    const message = `Get suggestions for ${data?.person?.first_name}`;
    append({
      role: 'user',
      content: message,
      id: 'suggestion-header',
      data: {
        personId: data?.person?.id ?? null,
        personName: `${data?.person?.first_name} ${data?.person?.last_name}`
      } as const
    });
  };

  return (
    <>
      <div className='font-semibold'>
        {`${data?.person?.first_name} ${data?.person?.last_name}`}
      </div>

      <div className='flex items-center gap-1'>
        <Button variant='ghost' size='icon' onClick={handleSuggestions} title='Create suggestions'>
          <Sparkles className='size-4' />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          onClick={() =>
            onAction(`Create a new note for this person (ID: ${params.id}): 
          
          `)
          }
          title='Create new note'>
          <NotebookPen className='size-4' />
        </Button>
      </div>
    </>
  );
}
