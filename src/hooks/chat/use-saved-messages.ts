import { useEffect } from 'react';

import { Message } from 'ai';

import { useMessages } from '@/hooks/use-messages';
import { dateHandler } from '@/lib/dates/helpers';

interface UseSavedMessagesProps {
  setMessages: (updater: (messages: Message[]) => Message[]) => void;
  conversationId?: string | null;
  limit?: number;
}

export function useSavedMessages({
  conversationId,
  setMessages,
  limit = 10
}: UseSavedMessagesProps) {
  // Fetch messages for the conversation
  const {
    data: savedMessagesData,
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
    // Skip if no conversation or no messages
    if (!conversationId || !savedMessagesData?.messages) {
      return;
    }

    const newMessages = savedMessagesData.messages;
    if (!newMessages?.length) {
      return;
    }

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
  }, [savedMessagesData?.messages, setMessages, conversationId]);

  // Return the data and functions needed by the component
  return {
    savedMessagesData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  };
}
