import { useQuery } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { ApiResponse } from '@/types/api-response';

type FileRow = Database['public']['Tables']['files']['Row'];

export function useFiles() {
  return useQuery<FileRow[]>({
    queryKey: ['files'],
    queryFn: async () => {
      const res = await fetch('/api/files');
      const json: ApiResponse<FileRow[]> = await res.json();
      if (!res.ok || json.error) {
        errorToast.show(json.error);
        throw json.error;
      }
      return json.data || [];
    }
  });
}
