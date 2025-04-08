'use client';

import Link from 'next/link';

import { Ban, Check, CircleDashed, HelpCircle, Loader2, X } from '@/components/icons';
import { routes } from '@/lib/routes';

type UpdateAISummaryJobProps = {
  run: {
    id: string;
    status: string;
    payload: {
      personId: string;
      personName: string;
    };
    createdAt: Date;
  };
  onClick?: () => void;
};

export function UpdateAISummaryJobNotifier({ run, onClick }: UpdateAISummaryJobProps) {
  const isPending = ['PENDING_VERSION', 'QUEUED', 'DELAYED'].includes(run.status);
  const isExecuting = ['EXECUTING', 'REATTEMPTING', 'WAITING'].includes(run.status);
  const isCompleted = ['COMPLETED'].includes(run.status);
  const isFailed = ['FAILED', 'CRASHED', 'SYSTEM_FAILURE'].includes(run.status);
  const isCancelled = ['CANCELED', 'INTERRUPTED', 'FROZEN'].includes(run.status);

  const StatusIcon = () => {
    if (isPending) return <CircleDashed className='size-4 animate-spin' />;
    if (isExecuting) return <Loader2 className='size-4 animate-spin' />;
    if (isCompleted) return <Check className='size-4 text-green-500' />;
    if (isFailed) return <X className='size-4 text-destructive' />;
    if (isCancelled) return <Ban className='size-4 text-destructive' />;
    return <HelpCircle className='size-4 text-muted-foreground' />;
  };

  return (
    <Link
      href={routes.person.summary({ id: run.payload.personId })}
      onClick={onClick}
      className='flex w-full items-start gap-3 border-b bg-background px-4 py-3 transition-colors hover:bg-accent'>
      <StatusIcon />
      <div className='min-w-0 flex-1'>
        <h4 className='truncate text-sm font-medium'>
          {isExecuting
            ? `Updating ${run.payload.personName}'s Summary`
            : `Updated ${run.payload.personName}'s Summary`}
        </h4>
        <p className='text-sm text-muted-foreground'>
          Based on your notes, Superleader updated the summary profile for {run.payload.personName}
        </p>
        <div className='mt-1 flex items-center justify-between'>
          <span className='text-xs text-muted-foreground'>
            {new Date(run.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
            {', '}
            {new Date(run.createdAt).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit'
            })}
          </span>
          <span className='text-xs font-medium text-primary'>View summary</span>
        </div>
      </div>
    </Link>
  );
}
