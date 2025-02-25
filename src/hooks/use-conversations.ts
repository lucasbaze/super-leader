import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';

interface UseConversationsProps {
  limit?: number;
}

export function useConversations({ limit }: UseConversationsProps = {}) {
  return useQuery({
    queryKey: ['conversations', limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`/api/conversations?${params.toString()}`);
      const json = await response.json();

      if (!response.ok || !json.success) {
        errorToast.show(json.error);
      }

      return json.data;
    }
  });
}

interface UseCreateConversationProps {
  onSuccess?: (data: any) => void;
}

export function useCreateConversation({ onSuccess }: UseCreateConversationProps = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        errorToast.show(json.error);
      }

      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (onSuccess) onSuccess(data);
    }
  });
}
