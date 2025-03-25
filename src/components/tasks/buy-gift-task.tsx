'use client';

import Link from 'next/link';

import { z } from 'zod';

import { cn } from '@/lib/utils';
import { buyGiftActionSchema, GetTaskSuggestionResult } from '@/services/tasks/types';

import { BaseTaskCard } from './base-task-card';

const isBuyGiftAction = (action: any): action is z.infer<typeof buyGiftActionSchema> => {
  return 'suggestedGifts' in action;
};

export const BuyGiftTask = ({ task }: { task: GetTaskSuggestionResult }) => {
  if (!isBuyGiftAction(task.suggestedAction)) {
    return null;
  }

  return (
    <BaseTaskCard
      task={task}
      actionBody={<BuyGiftCardActionBody suggestedGifts={task.suggestedAction.suggestedGifts} />}
    />
  );
};

type BuyGiftCardActionBodyProps = {
  suggestedGifts: z.infer<typeof buyGiftActionSchema>['suggestedGifts'];
};

const BuyGiftCardActionBody = ({ suggestedGifts }: BuyGiftCardActionBodyProps) => {
  return (
    <div className='flex flex-col gap-3'>
      {suggestedGifts.map((gift, index) => (
        <Link href={gift.url} key={index} target='_blank' rel='noopener noreferrer'>
          <div
            key={index}
            className={cn(
              'relative rounded-md border p-3',
              'bg-muted/10 hover:bg-muted/20 transition-colors'
            )}>
            <div className='flex flex-col'>
              {/* Gift Header */}
              <div>
                <h4 className='text-sm font-medium'>{gift.title}</h4>
              </div>

              {/* Gift Description */}
              <p className='mb-2 max-w-[90%] text-sm text-muted-foreground'>{gift.reason}</p>

              {/* Gift Link */}
              <div className='flex items-center'>
                <div className='hover:text-primary/80 text-sm text-primary'>{gift.url}</div>
              </div>
            </div>
            <span className='absolute right-2 top-2 rounded-full bg-muted px-2 py-0.5 text-xs capitalize'>
              {gift.type}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};
