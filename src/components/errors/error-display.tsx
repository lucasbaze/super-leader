import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TError } from '@/types/errors';

interface ErrorDisplayProps {
  error: TError;
  className?: string;
}

export function ErrorDisplay({ error, className }: ErrorDisplayProps) {
  return (
    <Alert variant='destructive' className={className}>
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {error.displayMessage || 'An unexpected error occurred. Please try again.'}
      </AlertDescription>
    </Alert>
  );
}
