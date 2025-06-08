'use client';

import { Loader } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useConnectUnipileAccount } from '@/hooks/use-connect-unipile-account';

export default function IntegrationsPage() {
  const { mutate: connectAccount, error, isPending } = useConnectUnipileAccount();

  const handleConnectAccount = () => {
    connectAccount(undefined, {
      onSuccess: (url) => {
        window.location.href = url;
      }
    });
  };

  return (
    <div className='mx-auto max-w-xl py-12'>
      <h1 className='mb-6 text-2xl font-bold'>Integrations</h1>
      <Button onClick={handleConnectAccount} disabled={isPending}>
        {isPending ? <Loader className='mr-2 size-4' /> : null}
        Connect an account
      </Button>
      {error && <div className='mt-4 text-red-600'>{(error as Error).message}</div>}
    </div>
  );
}
