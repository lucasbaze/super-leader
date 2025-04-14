import { useMutation, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { toError } from '@/lib/errors';

export function useUpdateUserProfileSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/user/profile/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const json = await response.json();

      if (!response.ok) {
        throw json.error;
      }

      return json.data;
    },
    onError: (err) => {
      errorToast.show(toError(err));
    },
    onSuccess: () => {
      // Invalidate the user profile query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    }
  });
}
