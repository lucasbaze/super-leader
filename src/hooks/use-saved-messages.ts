import { useEffect } from 'react';

import { Message } from 'ai';

import { useMessages } from '@/hooks/use-messages';
import { dateHandler } from '@/lib/dates/helpers';
import { TMessageType } from '@/lib/messages/constants';

interface UseSavedMessagesProps {
  chatType: TMessageType;
  chatId: string;
  pathname: string;
  setMessages: (updater: (messages: Message[]) => Message[]) => void;
  limit?: number;
}

export function useSavedMessages({
  chatType,
  chatId,
  pathname,
  setMessages,
  limit = 10
}: UseSavedMessagesProps) {
  // Get message parameters based on chat type
  const getMessageParams = (type: TMessageType, id: string) => {
    if (type === 'person') {
      return { type, personId: id };
    } else if (type === 'group') {
      return { type, groupId: id };
    } else {
      return { type };
    }
  };

  // Fetch messages from the API
  const {
    data: savedMessagesData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  } = useMessages({
    ...getMessageParams(chatType, chatId),
    limit,
    path: pathname
  });

  // Update messages when new data is received
  useEffect(() => {
    // messagesData.messages comes from the useMessages hook which returns a messages array
    // @ts-ignore
    const newMessages = savedMessagesData?.messages;
    if (!newMessages?.length) {
      return;
    }

    setMessages((prevMessages) => {
      // Create a Map for O(1) lookups, using most recent version of each message
      const messageMap = new Map(prevMessages.map((msg) => [msg.id, msg]));

      // Update map with any new messages, automatically handling duplicates
      newMessages.forEach((msg: Message) => {
        messageMap.set(msg.id, msg);
      });

      // Convert map values back to array and sort once
      return Array.from(messageMap.values()).sort((a, b) =>
        dateHandler(a.createdAt).isBefore(dateHandler(b.createdAt)) ? -1 : 1
      );
    });
    // @ts-ignore
  }, [savedMessagesData?.messages, setMessages]);

  // Return the data and functions needed by the component
  return {
    savedMessagesData,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  };
}
