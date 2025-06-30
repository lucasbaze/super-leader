'use client';

import Link from 'next/link';

import { JobStatusIcon } from '@/components/jobs/job-status-icon';
import { formatJobTime, getJobStatusState } from '@/lib/jobs/status-utils';
import { routes } from '@/lib/routes';

type SyncLinkedInConnectionsJobProps = {
  run: {
    id: string;
    status: string;
    payload: {
      userId: string;
      accountId: string;
    };
    createdAt: Date;
  };
  onClick?: () => void;
};

export function SyncLinkedInConnectionsJobNotifier({ run, onClick }: SyncLinkedInConnectionsJobProps) {
  const { isPending, isExecuting, isCompleted, isFailed, isCancelled } = getJobStatusState(run.status);

  const getStatusText = () => {
    if (isExecuting) return 'Superleader is currently syncing your LinkedIn connections';
    if (isCompleted) return 'Successfully synced your LinkedIn connections';
    if (isPending) return 'LinkedIn sync is pending';
    if (isFailed) return 'Failed to sync LinkedIn connections. Please contact support to fix this issue!';
    if (isCancelled) return 'LinkedIn sync was cancelled';
  };

  return (
    <Link
      href={routes.settings.integrations()}
      onClick={onClick}
      className='flex w-full items-start gap-3 border-b bg-background px-4 py-3 transition-colors hover:bg-accent'>
      <JobStatusIcon status={run.status} />
      <div className='min-w-0 flex-1'>
        <h4 className='truncate text-sm font-medium'>
          {isExecuting ? 'Syncing LinkedIn Connections' : 'LinkedIn Connections Synced'}
        </h4>
        <p className='text-sm text-muted-foreground'>{getStatusText()}</p>
        <div className='mt-1 flex items-center justify-between'>
          <span className='text-xs text-muted-foreground'>{formatJobTime(run.createdAt)}</span>
          <span className='text-xs font-medium text-primary'>View integrations</span>
        </div>
      </div>
    </Link>
  );
}
