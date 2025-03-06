'use client';

import { Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TContextMessage } from '@/services/context/generate-initial-context-message';

import { MarkdownMessage } from '../messages/markdown-message';

type ContextMessageCardProps = TContextMessage;

export function ContextMessageCard({
  initialQuestion,
  followUpQuestions,
  priority,
  reasoning
}: ContextMessageCardProps) {
  return (
    <div className='flex w-full max-w-[90%] flex-col gap-2'>
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Info className='size-4' />
        <span>Context-aware question</span>
      </div>

      <div className='rounded-sm bg-muted px-3 py-2 text-sm'>
        <MarkdownMessage content={initialQuestion} />
      </div>

      <div className='mt-2'>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' size='sm' className='flex items-center gap-2'>
              <span>View reasoning</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-80'>
            <div className='space-y-2'>
              <h4 className='font-medium'>Reasoning</h4>
              <p className='text-sm text-muted-foreground'>{reasoning}</p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
