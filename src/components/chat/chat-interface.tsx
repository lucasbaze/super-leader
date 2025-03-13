'use client';

import { useRef } from 'react';

import { useChatInterface } from '@/hooks/chat/use-chat-interface';
import { useSavedMessages } from '@/hooks/chat/use-saved-messages';
import { useScrollHandling } from '@/hooks/use-scroll-handling';
import {
  CONVERSATION_OWNER_TYPES,
  ConversationOwnerType
} from '@/services/conversations/constants';
import { Conversation } from '@/types/database';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessagesList } from './chat-messages-list';

interface ChatInterfaceProps {
  conversationId: string | null;
  conversations: any[];
  isLoadingConversations: boolean;
  handleCreateConversation: ({ title }: { title: string }) => Promise<Conversation>;
  handleStartNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  conversationType: ConversationOwnerType;
  conversationIdentifier: string;
}

const getExtraBody = (conversationType: ConversationOwnerType, conversationIdentifier: string) => {
  if (conversationType === CONVERSATION_OWNER_TYPES.PERSON) {
    return {
      personId: conversationIdentifier
    };
  }
  return {};
};

export function ChatInterface({
  conversationId,
  conversations,
  isLoadingConversations,
  handleCreateConversation,
  handleStartNewConversation,
  onSelectConversation,
  conversationType,
  conversationIdentifier
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Set up chat interface
  const chatInterface = useChatInterface({
    conversationId,
    handleCreateConversation,
    extraBody: getExtraBody(conversationType, conversationIdentifier)
  });

  // Get saved messages
  const { savedMessagesData, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useSavedMessages({
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

  return (
    <div className='absolute inset-0 flex flex-col'>
      <ChatHeader
        append={chatInterface.append}
        conversations={conversations}
        isLoadingConversations={isLoadingConversations}
        activeConversationId={conversationId || ''}
        onSelectConversation={onSelectConversation}
        onNewConversation={handleStartNewConversation}
      />
      <div className='relative flex-1 overflow-hidden'>
        <ChatMessagesList
          ref={messagesContainerRef}
          messages={chatInterface.messages}
          isLoading={chatInterface.isLoading}
          isLoadingConversations={isLoadingConversations}
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
