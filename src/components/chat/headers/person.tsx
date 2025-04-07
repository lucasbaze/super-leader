'use client';

import { useParams } from 'next/navigation';

import { ChatRequestOptions, CreateMessage, Message } from 'ai';

import { Gift, NotebookPen, Sparkles } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCreateMessage } from '@/hooks/use-messages';
import { usePerson } from '@/hooks/use-person';
import { $user } from '@/lib/llm/messages';
import { MESSAGE_TYPE } from '@/lib/messages/constants';
import { randomString } from '@/lib/utils';

import { DefaultChatHeader } from './default';

interface ChatHeaderProps {
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  conversationId: string | null;
}

export function PersonChatHeader({ append, conversationId }: ChatHeaderProps) {
  const params = useParams();
  const createMessage = useCreateMessage();
  const { data, isLoading } = usePerson(params.id as string, {
    withInteractions: true
  });

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

    if (conversationId) {
      await createMessage.mutateAsync({
        conversationId,
        message: $user(message)
      });
    }
  };

  const handleSuggestions = async () => {
    const message = `Get content suggestions for ${data?.person?.first_name}`;
    append(
      {
        role: 'user',
        content: message,
        id: randomString(12)
      },
      {
        data: {
          personId: data?.person?.id ?? null,
          personName: `${data?.person?.first_name} ${data?.person?.last_name}`
        } as const
      }
    );

    if (conversationId) {
      await createMessage.mutateAsync({
        conversationId,
        message: $user(message)
      });
    }
  };

  return (
    <>
      <div className='font-semibold'>
        {data?.person?.first_name} {data?.person?.last_name}
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
              {hasInteractions ? 'Ask for gift suggestions' : 'Must have at least 1 interaction'}
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
              {hasInteractions ? 'Ask for content suggestions' : 'Must have at least 1 interaction'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}
