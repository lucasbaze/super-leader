import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { toError } from '@/lib/errors';
import { ApiResponse } from '@/types/api-response';
import { File } from '@/types/database';

export function useFiles() {
  return useQuery<File[]>({
    queryKey: ['files'],
    queryFn: async () => {
      const res = await fetch('/api/files');
      const json: ApiResponse<File[]> = await res.json();
      if (!res.ok || json.error) {
        errorToast.show(json.error || toError(new Error('Failed to fetch files')));
        throw json.error;
      }
      return json.data || [];
    }
  });
}
