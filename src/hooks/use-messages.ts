import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { TCreateMessageRequest } from '@/app/api/messages/route';
import { errorToast } from '@/components/errors/error-toast';
import { MESSAGE_TYPE } from '@/lib/messages/constants';
import { TChatMessage } from '@/services/messages/create-message';
import { TGetMessagesResponse } from '@/services/messages/get-messages';

type UseMessagesParams = {
  type: (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
  personId?: string;
  groupId?: string;
  limit?: number;
};

async function fetchMessages({
  type,
  personId,
  groupId,
  cursor,
  limit = 10
}: UseMessagesParams & { cursor?: string }): Promise<TGetMessagesResponse> {
  const params = new URLSearchParams({
    type,
    ...(limit && { limit: limit.toString() }),
    ...(cursor && { cursor }),
    ...(personId && { personId }),
    ...(groupId && { groupId })
  });

  const response = await fetch(`/api/messages?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  const json = await response.json();
  return json.data;
}

export function useMessages({ type, personId, groupId, limit }: UseMessagesParams) {
  return useInfiniteQuery({
    queryKey: ['messages', { type, personId, groupId }],
    queryFn: ({ pageParam }) =>
      fetchMessages({ type, personId, groupId, limit, cursor: pageParam }),
    initialPageParam: undefined,
    // @ts-ignore TODO: Investigate why this is throwing an overload error on the types?
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      messages: data.pages.flatMap((page) => page.messages.map((message) => message.message)),
      hasMore: data.pages[data.pages.length - 1].hasMore
    })
  });
}

export function useCreateMessage() {
  // const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TCreateMessageRequest) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const json = await response.json();
      if (json.error) {
        errorToast.show(json.error);
        throw json.error;
      }
      return json.data as TChatMessage;
    },
    onSuccess: (newMessage) => {
      // TODO: Determine if this is needed. Update the query cache
      // Get the queryKey based on the message type and IDs
      // const queryKey = [
      //   'messages',
      //   {
      //     type: newMessage.type,
      //     ...(newMessage.person_id && { personId: newMessage.person_id }),
      //     ...(newMessage.group_id && { groupId: newMessage.group_id })
      //   }
      // ];
      // queryClient.setQueryData<{ pages: { messages: TChatMessage[] }[] }>(
      //   queryKey,
      //   (oldData) => {
      //     if (!oldData) return { pages: [{ messages: [newMessage] }] };
      //     // Add the new message to the first page
      //     const newPages = [...oldData.pages];
      //     newPages[0] = {
      //       ...newPages[0],
      //       messages: [newMessage, ...newPages[0].messages]
      //     };
      //     return {
      //       ...oldData,
      //       pages: newPages
      //     };
      //   }
      // );
    }
  });
}
