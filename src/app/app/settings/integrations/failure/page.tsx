import Link from 'next/link';

import { XCircle } from '@/components/icons';
import { Button } from '@/components/ui/button';

export default function IntegrationFailurePage() {
  return (
    <div className='flex h-full flex-col items-center justify-center py-24'>
      <XCircle className='mb-4 text-red-500' size={64} />
      <h1 className='mb-2 text-2xl font-bold'>Integration Failed</h1>
      <p className='mb-6 max-w-lg text-center text-muted-foreground'>
        Darn it. Seems something went wrong. Please contact support to fix this issue! We want you to get integrated as
        soon as possible!
      </p>
      <div className='flex flex-col items-center gap-2'>
        <a href='mailto:lucas@superleader.ai?subject=Integration%20Failed'>
          <Button asChild>
            <span>Email Support</span>
          </Button>
        </a>
        <Link href='/app/settings/integrations' passHref>
          <Button asChild variant='ghost'>
            <span>Back to Integrations</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
