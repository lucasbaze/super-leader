import { useEffect } from 'react';

import { Message } from 'ai';

import { useInitialMessage } from '@/hooks/use-messages';
import { dateHandler } from '@/lib/dates/helpers';

interface UseInitialMessagesProps {
  setMessages: (updater: (messages: Message[]) => Message[]) => void;
  conversationId?: string | null;
  type?: string;
  identifier?: string;
}

export function useInitialMessages({
  conversationId,
  type,
  identifier,
  setMessages
}: UseInitialMessagesProps) {
  console.log('conversationId: ', conversationId);
  console.log('type: ', type);
  console.log('identifier: ', identifier);

  const {
    data: initialMessages,
    isLoading,
    isFetching
  } = useInitialMessage({
    conversationId: conversationId || '',
    type: type || 'default',
    identifier,
    enabled: !conversationId // Only fetch when we DO NOT have a conversationId
  });

  console.log('initialMessages: ', initialMessages);

  // Update messages when new data is received
  useEffect(() => {
    // Skip if no conversation or no messages
    if (conversationId || !initialMessages) {
      return;
    }

    if (!initialMessages.length) {
      return;
    }

    setMessages((prevMessages) => {
      // Create a Map for O(1) lookups, using most recent version of each message
      const messageMap = new Map(prevMessages.map((msg) => [msg.id, msg]));

      // Update map with any new messages, automatically handling duplicates
      initialMessages.forEach((msg: Message) => {
        messageMap.set(msg.id, msg);
      });

      // Convert map values back to array and sort once
      return Array.from(messageMap.values()).sort((a, b) =>
        dateHandler(a.createdAt).isBefore(dateHandler(b.createdAt)) ? -1 : 1
      );
    });
  }, [initialMessages, setMessages, conversationId]);

  // Return the data and loading state needed by the component
  return {
    initialMessages,
    isLoading: isLoading || isFetching
  };
}
