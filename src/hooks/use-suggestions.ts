import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';

import { TUpdateSuggestionRequest } from '@/app/api/suggestions/[suggestionId]/route';
import { errorToast } from '@/components/errors/error-toast';
import { ContentSuggestionWithId } from '@/services/suggestions/types';

export async function fetchSuggestions(
  queryClient: QueryClient,
  id: string
): Promise<ContentSuggestionWithId[]> {
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

export function useUpdateSuggestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      suggestionId,
      ...updates
    }: {
      suggestionId: string;
      viewed?: boolean;
      saved?: boolean;
      bad?: boolean;
    }) => {
      const response = await fetch(`/api/suggestions/${suggestionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const json = await response.json();
      if (json.error) {
        errorToast.show(json.error);
        throw json.error;
      }
      return json.data;
    },
    onSuccess: () => {
      // Invalidate suggestions queries?
      // The suggestions isn't being used, and might actually create an issue since suggestions are generated on the fly from the /chat route
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    }
  });
}
