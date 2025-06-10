import { useMutation } from '@tanstack/react-query';

import { AccountName } from '@/types/custom';

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
