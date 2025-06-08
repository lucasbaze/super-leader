import Link from 'next/link';

import { CheckCircle } from '@/components/icons';
import { Button } from '@/components/ui/button';

export default function IntegrationSuccessPage() {
  return (
    <div className='flex h-full flex-col items-center justify-center py-24'>
      <CheckCircle className='mb-4 text-green-500' size={64} />
      <h1 className='mb-2 text-2xl font-bold'>Integration Successful!</h1>
      <p className='mb-6 max-w-md text-center text-muted-foreground'>
        Your account has been successfully connected. You can now use all available features for this integration.
      </p>
      <Link href='/app/settings/integrations' passHref legacyBehavior>
        <Button asChild>
          <span>Back to Integrations</span>
        </Button>
      </Link>
    </div>
  );
}
