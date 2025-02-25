'use client';

import { useParams, usePathname } from 'next/navigation';
import { useRef } from 'react';

import { useChatInterface } from '@/hooks/use-chat-interface';
import { usePerson } from '@/hooks/use-person';
import { useSavedMessages } from '@/hooks/use-saved-messages';
import { useScrollHandling } from '@/hooks/use-scroll-handling';
import { MESSAGE_TYPE } from '@/lib/messages/constants';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessagesList } from './chat-messages-list';
import { getChatType } from './utils';

const useChatParams = (params: any, pathname: string) => {
  const { type, id } = getChatType(pathname, params.id);
  return { chatType: type, chatId: id };
};

export function ChatInterface() {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const params = useParams();
  const pathname = usePathname();
  const { chatType, chatId } = useChatParams(params, pathname);

  // Get person data if needed
  const { data: personData } = usePerson(
    chatType === MESSAGE_TYPE.PERSON ? (params.id as string) : null
  );

  // Set up chat interface
  const chatInterface = useChatInterface({
    apiEndpoint: '/api/chat',
    chatParams: {
      id: chatId,
      type: chatType
    },
    chatType,
    chatId
  });

  // Get saved messages
  const { savedMessagesData, fetchNextPage, isFetchingNextPage, hasNextPage } = useSavedMessages({
    chatType,
    chatId,
    pathname,
    setMessages: chatInterface.setMessages
  });

  // Handle scrolling behavior
  const { handleScroll } = useScrollHandling({
    containerRef: messagesContainerRef,
    messagesData: savedMessagesData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  });

  return (
    <div className='absolute inset-0 flex flex-col'>
      <ChatHeader append={chatInterface.append} />
      <div className='relative flex-1 overflow-hidden'>
        <ChatMessagesList
          ref={messagesContainerRef}
          messages={chatInterface.messages}
          isLoading={chatInterface.isLoading}
          append={chatInterface.append}
          onScroll={handleScroll}
          messagesEndRef={messagesEndRef}
          fetchNextPage={fetchNextPage}
          isFetchingNextPage={isFetchingNextPage}
          hasMore={hasNextPage || false}
          pendingAction={chatInterface.pendingAction}
          setPendingAction={chatInterface.setPendingAction}
          addToolResult={chatInterface.addToolResult}
        />
      </div>
      <ChatInput
        input={chatInterface.input}
        handleInputChange={chatInterface.handleInputChange}
        handleSubmit={chatInterface.handleSubmit}
        isLoading={chatInterface.isLoading}
      />
    </div>
  );
}
