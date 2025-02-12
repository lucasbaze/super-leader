'use client';

import { useParams } from 'next/navigation';

import { ChatRequestOptions, CreateMessage, Message } from 'ai';

import { Gift, NotebookPen, Sparkles } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { usePerson } from '@/hooks/use-person';
import { randomString } from '@/lib/utils';

import { DefaultChatHeader } from './default';

interface ChatHeaderProps {
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

export function PersonChatHeader({ append }: ChatHeaderProps) {
  const params = useParams();
  const { data, isLoading } = usePerson(params.id as string, {
    withInteractions: true
  });
  console.log('Person Chat Header data', data);

  if (isLoading) return <DefaultChatHeader />;

  const hasInteractions = data?.interactions && data.interactions.length > 0;

  const handleGiftSuggestions = async () => {
    const message = `Get gift suggestions for ${data?.person?.first_name}`;
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

  const handleSuggestions = async () => {
    const message = `Get content suggestions for ${data?.person?.first_name}`;
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
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div className='hover:cursor-pointer'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleGiftSuggestions}
                  disabled={!hasInteractions}>
                  <Gift className='size-4' />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {hasInteractions ? 'Get Gift Suggestions' : 'Must have at least 1 interaction'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip delayDuration={0}>
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
      </div>
    </>
  );
}
