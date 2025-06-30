'use client';

import { JobStatusIcon } from '@/components/jobs/job-status-icon';
import { formatJobTime, getJobStatusState } from '@/lib/jobs/status-utils';

type ImportContactsJobProps = {
  run: {
    id: string;
    status: string;
    payload: { filePath: string };
    createdAt: Date;
  };
};

export function ImportContactsNotifier({ run }: ImportContactsJobProps) {
  const { isExecuting } = getJobStatusState(run.status);
  return (
    <div className='flex w-full items-start gap-3 border-b bg-background px-4 py-3'>
      <JobStatusIcon status={run.status} />
      <div className='min-w-0 flex-1'>
        <h4 className='truncate text-sm font-medium'>
          {isExecuting ? 'Importing Contacts' : 'Contacts Imported'}
        </h4>
        <p className='text-sm text-muted-foreground'>{run.payload.filePath}</p>
        <div className='mt-1 flex items-center justify-between'>
          <span className='text-xs text-muted-foreground'>{formatJobTime(run.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
