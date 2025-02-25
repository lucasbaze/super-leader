import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { Message } from '@/types/database';

interface UseMessagesProps {
  conversationId: string;
  limit?: number;
  enabled?: boolean;
}

export function useMessages({ conversationId, limit, enabled = true }: UseMessagesProps) {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId, limit],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.append('conversationId', conversationId);
      if (limit) params.append('limit', limit.toString());
      if (pageParam) params.append('cursor', pageParam);

      const response = await fetch(`/api/messages?${params.toString()}`);
      const json = await response.json();

      if (!response.ok || !json.success) {
        errorToast.show(json.error);
      }

      return json.data;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || null,
    select: (data) => {
      const sorted = data.pages.flatMap((page) =>
        page.messages.sort((a: Message, b: Message) => a.created_at.localeCompare(b.created_at))
      );

      return {
        messages: sorted.map((message: Message) => message.message),
        hasNextPage: data.pages[data.pages.length - 1]?.hasMore || false
      };
    },
    enabled // Only run the query if enabled is true
  });
}

interface UseCreateMessageProps {
  onSuccess?: (data: any) => void;
}

export function useCreateMessage({ onSuccess }: UseCreateMessageProps = {}) {
  return useMutation({
    mutationFn: async ({ message, conversationId }: { message: any; conversationId: string }) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ message, conversationId })
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        errorToast.show(json.error);
      }

      return json.data;
    },
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
    }
  });
}
