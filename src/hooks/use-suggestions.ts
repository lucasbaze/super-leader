import { QueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
// TODO: move this to the right type file
import { TSuggestion } from '@/services/suggestions/get-suggestions-for-person';

export async function fetchSuggestions(
  queryClient: QueryClient,
  id: string
): Promise<TSuggestion[]> {
  return queryClient.fetchQuery({
    queryKey: ['suggestions', id],
    queryFn: async () => {
      const response = await fetch(`/api/suggestions`, {
        method: 'POST',
        body: JSON.stringify({ personId: id })
      });
      const json = await response.json();

      if (!response.ok) {
        // TODO: Add Error Logger
        errorToast.show(json.error);
        throw new Error(json.error);
      }

      return json.data;
    }
  });
}
