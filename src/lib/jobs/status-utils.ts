import { Ban, Check, CircleDashed, HelpCircle, Loader2, X } from '@/components/icons';

export type JobStatus = string;

export interface JobStatusState {
  isPending: boolean;
  isExecuting: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isCancelled: boolean;
}

export function getJobStatusState(status: JobStatus): JobStatusState {
  return {
    isPending: ['PENDING_VERSION', 'QUEUED', 'DELAYED'].includes(status),
    isExecuting: ['EXECUTING', 'REATTEMPTING', 'WAITING'].includes(status),
    isCompleted: ['COMPLETED'].includes(status),
    isFailed: ['FAILED', 'CRASHED', 'SYSTEM_FAILURE'].includes(status),
    isCancelled: ['CANCELED', 'INTERRUPTED', 'FROZEN'].includes(status)
  };
}

export function getJobStatusIconName(
  status: JobStatus
): 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled' | 'unknown' {
  const { isPending, isExecuting, isCompleted, isFailed, isCancelled } = getJobStatusState(status);

  if (isPending) return 'pending';
  if (isExecuting) return 'executing';
  if (isCompleted) return 'completed';
  if (isFailed) return 'failed';
  if (isCancelled) return 'cancelled';
  return 'unknown';
}

export function formatJobTime(createdAt: Date): string {
  const date = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  const time = new Date(createdAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
  return `${date}, ${time}`;
}
