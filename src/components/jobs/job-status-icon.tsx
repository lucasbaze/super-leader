import { Ban, Check, CircleDashed, HelpCircle, Loader2, X } from '@/components/icons';
import { getJobStatusIconName, type JobStatus } from '@/lib/jobs/status-utils';

interface JobStatusIconProps {
  status: JobStatus;
  className?: string;
}

export function JobStatusIcon({ status, className = 'size-4' }: JobStatusIconProps) {
  const iconName = getJobStatusIconName(status);

  switch (iconName) {
    case 'pending':
      return <CircleDashed className={`${className} animate-spin`} />;
    case 'executing':
      return <Loader2 className={`${className} animate-spin`} />;
    case 'completed':
      return <Check className={`${className} text-green-500`} />;
    case 'failed':
      return <X className={`${className} text-destructive`} />;
    case 'cancelled':
      return <Ban className={`${className} text-destructive`} />;
    default:
      return <HelpCircle className={`${className} text-muted-foreground`} />;
  }
}
