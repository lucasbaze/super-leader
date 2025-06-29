import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import type { GetActionPlanServiceResult } from '@/services/action-plan/get-action-plan';
import type { ServiceResponse } from '@/types/service-response';

export function useActionPlan() {
  return useQuery<GetActionPlanServiceResult>({
    queryKey: ['action-plan'],
    queryFn: async () => {
      const response = await fetch('/api/action-plan', { credentials: 'include' });
      const json: ServiceResponse<GetActionPlanServiceResult> = await response.json();
      if (!json || json.error || !json.data) {
        if (json && json.error) errorToast.show(json.error);
        throw json?.error || new Error('No action plan data');
      }
      return json.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
}
