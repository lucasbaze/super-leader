'use client';

import { format } from 'date-fns';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserContext } from '@/types/database';

export interface ContextRawListProps {
  contexts?: UserContext[];
  isLoading?: boolean;
  error?: Error | null;
}

export function ContextRawList({ contexts, isLoading, error }: ContextRawListProps) {
  if (isLoading) {
    return (
      <div className='space-y-2 p-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='border-b pb-4'>
            <Skeleton className='mb-2 h-5 w-1/3' />
            <Skeleton className='mb-2 h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 text-center'>
        <h3 className='mb-2 text-xl font-medium'>Error loading context data</h3>
        <p className='text-muted-foreground'>{error.message}</p>
      </div>
    );
  }

  if (!contexts || contexts.length === 0) {
    return (
      <div className='p-6 text-center'>
        <h3 className='mb-2 text-xl font-medium'>No context data available</h3>
        <p className='text-muted-foreground'>
          Context data is generated as you share more about yourself and as you use the platform
          more and more.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className='flex flex-col'>
        <div className='max-h-[calc(100vh-14rem)] overflow-auto'>
          <div className='divide-y'>
            {contexts.map((context) => (
              <div key={context.id} className='relative p-4 hover:bg-muted'>
                <div className='absolute right-4 top-4'>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant={context.processed ? 'default' : 'outline'}>
                        {context.processed ? 'Processed' : 'Pending'}
                      </Badge>
                    </TooltipTrigger>
                    {context.processed && (
                      <TooltipContent>
                        <p className='max-w-xs text-sm'>
                          This context record has been included in your profile and goals planning
                          as appropriate
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
                <div className='space-y-2'>
                  <div>
                    <p className='text-md whitespace-pre-wrap font-medium'>{context.content}</p>
                  </div>
                  {context.reason && <p className='text-sm italic'>{context.reason}</p>}
                  <div className='text-xs'>
                    {format(new Date(context.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='border-t p-2 text-center'>
          <p className='text-xs text-muted-foreground'>Only showing the 20 most recent records</p>
        </div>
      </div>
    </TooltipProvider>
  );
}
