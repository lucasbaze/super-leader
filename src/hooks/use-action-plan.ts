import { useMutation } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';

export function useGenerateActionPlan() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/action-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();
      if (result.error) {
        throw result.error;
      }
      return result.data;
    },
    onError: (error: any) => {
      errorToast.show(error);
    }
  });
}
