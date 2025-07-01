'use client';

import Link from 'next/link';

import { JobStatusIcon } from '@/components/jobs/job-status-icon';
import { formatJobTime, getJobStatusState } from '@/lib/jobs/status-utils';
import { routes } from '@/lib/routes';

type ActionPlanJobProps = {
  run: {
    id: string;
    status: string;
    payload: {
      userId: string;
    };
    createdAt: Date;
  };
  onClick?: () => void;
};

export function ActionPlanNotifier({ run, onClick }: ActionPlanJobProps) {
  const { isExecuting, isCompleted, isPending, isFailed, isCancelled } = getJobStatusState(run.status);

  const getStatusText = () => {
    if (isExecuting) return 'Superleader is generating your personalized action plan';
    if (isCompleted) return 'Successfully generated your personalized action plan';
    if (isPending) return 'Action plan generation is pending';
    if (isFailed) return 'Failed to generate action plan. Please contact support to fix this issue!';
    if (isCancelled) return 'Action plan generation was cancelled';
    return 'Action plan status unknown';
  };

  const getTitle = () => {
    if (isExecuting) return 'Generating Action Plan';
    if (isCompleted) return 'Action Plan Generated';
    if (isPending) return 'Action Plan Pending';
    if (isFailed) return 'Action Plan Failed';
    if (isCancelled) return 'Action Plan Cancelled';
    return 'Action Plan';
  };

  return (
    <Link
      href={routes.app()}
      onClick={onClick}
      className='flex w-full items-start gap-3 border-b bg-background px-4 py-3 transition-colors hover:bg-accent'>
      <JobStatusIcon status={run.status} />
      <div className='min-w-0 flex-1'>
        <h4 className='truncate text-sm font-medium'>{getTitle()}</h4>
        <p className='text-sm text-muted-foreground'>{getStatusText()}</p>
        <div className='mt-1 flex items-center justify-between'>
          <span className='text-xs text-muted-foreground'>{formatJobTime(run.createdAt)}</span>
          <span className='text-xs font-medium text-primary'>View dashboard</span>
        </div>
      </div>
    </Link>
  );
}
