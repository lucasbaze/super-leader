'use client';

import { useParams } from 'next/navigation';

import { ChatRequestOptions, CreateMessage, Message } from 'ai';

import { NotebookPen, Sparkles } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePerson } from '@/hooks/use-person';
import { randomString } from '@/lib/utils';

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
  const { data, isLoading } = usePerson(params.id as string, {
    withInteractions: true
  });
  console.log('Person Chat Header data', data);

  if (isLoading) return <DefaultChatHeader />;

  const hasInteractions = data?.interactions && data.interactions.length > 0;

  const handleSuggestions = async () => {
    const message = `Get suggestions for ${data?.person?.first_name}`;
    append({
      role: 'user',
      content: message,
      id: randomString(12),
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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='hover:cursor-pointer'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleSuggestions}
                  disabled={!hasInteractions}>
                  <Sparkles className='size-4' />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {hasInteractions ? 'Get Content Suggestions' : 'Must have at least 1 interaction'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
