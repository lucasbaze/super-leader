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
  console.log('conversationId: ', conversationId);
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

  // const { data: initialMessages, isLoading: isLoadingInitialMessages } = useInitialMessage({
  //   conversationId: conversationId || '',
  //   type: type || 'default',
  //   identifier: identifier || '',
  //   enabled: !conversationId && !loadingConversations // Only fetch when we DO NOT have a conversationId
  // });

  // useEffect(() => {
  //   if (initialMessages && !isLoadingInitialMessages) {
  //     setMessages((prevMessages) => [...prevMessages, ...initialMessages]);
  //   }
  // }, [initialMessages, setMessages, isLoadingInitialMessages]);

  // Update messages when new data is received
  useEffect(() => {
    // Skip if no conversation or no messages
    if (!conversationId && !savedMessagesData?.messages) {
      console.log('Sending system message');
      sendSystemMessage?.({
        id: 'system-message',
        role: 'system',
        content: `Call the getInitialMessage tool to get the initial message for this conversation. The initial message type is ${type} and the initial message owner identifier is ${identifier}. Use these values verbatim in the tool call.`,
        createdAt: dateHandler().toDate()
      });
      return;
    }

    if (!conversationId || !savedMessagesData?.messages) {
      console.log('Conversation ID found, skipping system message');
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
    isLoading: isLoading || isFetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  };
}
