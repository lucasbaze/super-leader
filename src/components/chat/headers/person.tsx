'use client';

import { useParams } from 'next/navigation';

import { NotebookPen, Sparkles } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { usePerson } from '@/hooks/use-person';

import { DefaultChatHeader } from './default';

interface ChatHeaderProps {
  onAction: (message: string) => void;
  onSuggestions: () => Promise<any>;
}

export function PersonChatHeader({ onAction, onSuggestions }: ChatHeaderProps) {
  const params = useParams();
  const { data, isLoading } = usePerson(params.id as string);

  if (isLoading) return <DefaultChatHeader />;

  return (
    <>
      <div className='font-semibold'>
        {`${data?.person?.first_name} ${data?.person?.last_name}`}
      </div>

      <div className='flex items-center gap-1'>
        <Button variant='ghost' size='icon' onClick={() => onSuggestions()} title='Create new note'>
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
