import { useMutation, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';

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
