import { useEffect } from 'react';

import { Message } from 'ai';

import { useInitialMessage, useMessages } from '@/hooks/use-messages';
import { dateHandler } from '@/lib/dates/helpers';

interface UseSavedMessagesProps {
  setMessages: (updater: (messages: Message[]) => Message[]) => void;
  conversationId?: string | null;
  type?: string;
  identifier?: string;
  limit?: number;
  loadingConversations?: boolean;
  sendSystemMessage?: (message: Message) => void;
}

export function useSavedMessages({
  conversationId,
  setMessages,
  type,
  identifier,
  limit = 20,
  loadingConversations = true,
  sendSystemMessage
}: UseSavedMessagesProps) {
  // Fetch messages for the conversation
  const {
    data: savedMessagesData,
    isLoading,
    isFetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  } = useMessages({
    conversationId: conversationId || '',
    limit,
    enabled: !!conversationId // Only fetch when we have a conversationId
  });

  // Update messages when new data is received
  useEffect(() => {
    if (isLoading || isFetching) {
      return;
    }

    if (savedMessagesData?.messages && savedMessagesData?.messages.length > 0) {
      const newMessages = savedMessagesData.messages;

      setMessages((prevMessages) => {
        // Create a Map for O(1) lookups, using most recent version of each message
        const messageMap = new Map(prevMessages.map((msg) => [msg.id, msg]));

        // Update map with any new messages, automatically handling duplicates
        // @ts-ignore
        newMessages.forEach((msg: Message) => {
          messageMap.set(msg.id, msg);
        });

        // Convert map values back to array and sort once
        return Array.from(messageMap.values()).sort((a, b) =>
          dateHandler(a.createdAt).isBefore(dateHandler(b.createdAt)) ? -1 : 1
        );
      });
    } else if (!savedMessagesData?.messages || savedMessagesData?.messages.length === 0) {
      sendSystemMessage?.({
        id: 'system-message',
        role: 'system',
        content: `Call the getInitialMessage tool to get the initial message for this conversation. The initial message type is ${type} and the initial message owner identifier is ${identifier}. Use these values verbatim in the tool call.`,
        createdAt: dateHandler().toDate()
      });
      return;
    }
  }, [savedMessagesData?.messages, setMessages, conversationId, isLoading, isFetching]);

  // Return the data and functions needed by the component
  return {
    savedMessagesData,
    isLoading: isLoading || isFetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  };
}
