import { useMutation, useQuery } from '@tanstack/react-query';

import { AccountName } from '@/types/custom';
import { IntegratedAccount } from '@/types/database';

export function useConnectUnipileAccount() {
  return useMutation({
    mutationFn: async (accountName: AccountName) => {
      const response = await fetch(`/api/integrations/unipile/connect-account?account_name=${accountName}`, {
        method: 'POST'
      });
      const json = await response.json();
      if (!response.ok || !json?.data?.url) {
        throw new Error(json?.error?.displayMessage || 'Failed to get auth link');
      }
      return json.data.url;
    }
  });
}

export function useIntegratedAccounts() {
  return useQuery<IntegratedAccount[], Error>({
    queryKey: ['integrated-accounts'],
    queryFn: async () => {
      const res = await fetch('/api/integrations');
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.displayMessage || 'Failed to fetch integrations');
      return json.data || [];
    }
  });
}
