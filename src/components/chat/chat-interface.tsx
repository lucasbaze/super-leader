'use client';

import { useRef } from 'react';

import { useChatInterface } from '@/hooks/chat/use-chat-interface';
import { useSavedMessages } from '@/hooks/chat/use-saved-messages';
import { useScrollHandling } from '@/hooks/use-scroll-handling';
import { ChatType } from '@/lib/chat/utils';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessagesList } from './chat-messages-list';

interface ChatInterfaceProps {
  conversationId: string | null;
  conversations: any[];
  isLoadingConversations: boolean;
  onCreateConversation: () => void;
  onSelectConversation: (id: string) => void;
  chatType: ChatType;
}

export function ChatInterface({
  conversationId,
  conversations,
  isLoadingConversations,
  onCreateConversation,
  onSelectConversation,
  chatType
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Set up chat interface
  const chatInterface = useChatInterface({
    apiEndpoint: '/api/chat',
    conversationId
  });

  // Get saved messages
  const { savedMessagesData, fetchNextPage, isFetchingNextPage, hasNextPage } = useSavedMessages({
    conversationId,
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

  // Show loading state if we're still loading conversations
  if (isLoadingConversations) {
    return <div className='flex h-full items-center justify-center'>Loading...</div>;
  }

  return (
    <div className='absolute inset-0 flex flex-col'>
      <ChatHeader
        append={chatInterface.append}
        conversations={conversations}
        activeConversationId={conversationId || ''}
        onSelectConversation={onSelectConversation}
        onCreateConversation={onCreateConversation}
      />
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
