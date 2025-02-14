import { useInfiniteQuery } from '@tanstack/react-query';

import { MESSAGE_TYPE } from '@/lib/messages/constants';
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
      messages: data.pages.flatMap((page) => page.messages),
      hasMore: data.pages[data.pages.length - 1].hasMore
    })
  });
}
