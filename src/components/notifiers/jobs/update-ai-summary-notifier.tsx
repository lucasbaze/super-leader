'use client';

import Link from 'next/link';

import { JobStatusIcon } from '@/components/jobs/job-status-icon';
import { formatJobTime, getJobStatusState } from '@/lib/jobs/status-utils';
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
  const { isExecuting } = getJobStatusState(run.status);

  return (
    <Link
      href={routes.person.summary({ id: run.payload.personId })}
      onClick={onClick}
      className='flex w-full items-start gap-3 border-b bg-background px-4 py-3 transition-colors hover:bg-accent'>
      <JobStatusIcon status={run.status} />
      <div className='min-w-0 flex-1'>
        <h4 className='truncate text-sm font-medium'>
          {isExecuting ? `Updating ${run.payload.personName}'s Summary` : `Updated ${run.payload.personName}'s Summary`}
        </h4>
        <p className='text-sm text-muted-foreground'>
          Based on your notes, Superleader updated the summary profile for {run.payload.personName}
        </p>
        <div className='mt-1 flex items-center justify-between'>
          <span className='text-xs text-muted-foreground'>{formatJobTime(run.createdAt)}</span>
          <span className='text-xs font-medium text-primary'>View summary</span>
        </div>
      </div>
    </Link>
  );
}
