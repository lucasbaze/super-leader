import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { errorToast } from '@/components/errors/error-toast';
import { ConversationOwnerType } from '@/services/conversations/constants';

interface UseConversationsProps {
  ownerType: ConversationOwnerType;
  ownerIdentifier: string;
  limit?: number;
}

export function useConversations({ ownerType, ownerIdentifier, limit }: UseConversationsProps) {
  return useQuery({
    queryKey: ['conversations', ownerType, ownerIdentifier, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('ownerType', ownerType);
      params.append('ownerIdentifier', ownerIdentifier);
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

interface CreateConversationParams {
  name: string;
  ownerType: ConversationOwnerType;
  ownerIdentifier: string;
}

export function useCreateConversation({ onSuccess }: UseCreateConversationProps = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, ownerType, ownerIdentifier }: CreateConversationParams) => {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ name, ownerType, ownerIdentifier })
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        errorToast.show(json.error);
      }

      return json.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['conversations', data.owner_type, data.owner_identifier]
      });
      if (onSuccess) onSuccess(data);
    }
  });
}

interface UseUpdateConversationProps {
  onSuccess?: (data: any) => void;
}

interface UpdateConversationParams {
  conversationId: string;
  name: string;
  ownerType: ConversationOwnerType;
  ownerIdentifier: string;
}

export function useUpdateConversation({ onSuccess }: UseUpdateConversationProps = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, name }: UpdateConversationParams) => {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name })
      });
      const json = await response.json();

      if (!response.ok || !json.success) {
        errorToast.show(json.error);
      }

      return json.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['conversations', variables.ownerType, variables.ownerIdentifier]
      });
    }
  });
}
