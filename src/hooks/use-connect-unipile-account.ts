import { useMutation } from '@tanstack/react-query';

export function useConnectUnipileAccount() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/integrations/unipile/connect-account', {
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
