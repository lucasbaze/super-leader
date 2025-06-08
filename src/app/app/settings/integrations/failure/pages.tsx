import Link from 'next/link';

import { XCircle } from '@/components/icons';
import { Button } from '@/components/ui/button';

export default function IntegrationFailurePage() {
  return (
    <div className='flex h-full flex-col items-center justify-center py-24'>
      <XCircle className='mb-4 text-red-500' size={64} />
      <h1 className='mb-2 text-2xl font-bold'>Integration Failed</h1>
      <p className='mb-6 max-w-md text-center text-muted-foreground'>
        We were unable to connect your account. Please try again or contact support if the problem persists.
      </p>
      <Link href='/app/settings/integrations' passHref legacyBehavior>
        <Button asChild>
          <span>Back to Integrations</span>
        </Button>
      </Link>
    </div>
  );
}
