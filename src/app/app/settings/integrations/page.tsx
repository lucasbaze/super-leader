'use client';

import { Loader } from '@/components/icons';
import { IntegrationList } from '@/components/integrations/integration-list';
import { useConnectUnipileAccount, useIntegratedAccounts } from '@/hooks/use-integrations';
import { ACCOUNT_NAMES, AccountName } from '@/types/custom';

export default function IntegrationsPage() {
  const { mutate: connectAccount, error: connectError, isPending } = useConnectUnipileAccount();
  const { data: integratedAccounts, isLoading, error } = useIntegratedAccounts();

  const handleConnectAccount = (accountName: AccountName) => {
    connectAccount(accountName, {
      onSuccess: (url) => {
        window.location.href = url;
      }
    });
  };

  // TODO: Re-sync the account / contacts
  // TODO: Disconnect the account
  // TODO: Reconnect the account

  return (
    <div className='mx-auto max-w-xl py-12'>
      <h1 className='mb-6 text-2xl font-bold'>Integrations</h1>
      {isLoading ? (
        <div className='flex items-center gap-2 text-gray-500'>
          <Loader className='size-4 animate-spin' /> Loading integrations...
        </div>
      ) : error ? (
        <div className='text-red-600'>Failed to load integrations: {error.message}</div>
      ) : (
        <IntegrationList integratedAccounts={integratedAccounts || []} onConnect={handleConnectAccount} />
      )}
      {connectError && <div className='mt-4 text-red-600'>{(connectError as Error).message}</div>}
    </div>
  );
}
