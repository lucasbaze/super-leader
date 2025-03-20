'use client';

import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

import { Message } from 'ai';

import { useChatConversations } from '@/hooks/chat/use-chat-conversations';
import { useChatInterface } from '@/hooks/chat/use-chat-interface';
import { useSavedMessages } from '@/hooks/chat/use-saved-messages';
import { useScrollHandling } from '@/hooks/use-scroll-handling';
import { useChatConfig } from '@/lib/chat/chat-context';
import { cn } from '@/lib/utils';
import {
  CONVERSATION_OWNER_TYPES,
  ConversationOwnerType
} from '@/services/conversations/constants';
import { Conversation } from '@/types/database';

interface HeaderProps {
  conversations: Conversation[];
  conversationId: string | null;
  onSelectConversation: (id: string) => void;
}

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

interface InputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

interface RenderComponents {
  Header?: React.ComponentType<HeaderProps>;
  MessagesList?: React.ComponentType<MessagesListProps>;
  Input?: React.ComponentType<InputProps>;
}

interface BaseChatInterfaceProps {
  components: RenderComponents;
  // Other base props that aren't related to rendering
  conversationType: ConversationOwnerType;
  conversationIdentifier: string;
  apiRoute?: string;
}

export function BaseChatInterface({
  components,
  conversationType,
  conversationIdentifier,
  apiRoute
}: BaseChatInterfaceProps) {
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { config } = useChatConfig();

  const { Header, MessagesList, Input } = components;

  const {
    conversationId,
    conversations,
    isLoadingConversations,
    handleCreateConversation,
    handleStartNewConversation,
    setConversationId
  } = useChatConversations({
    pathname
  });

  const chatInterface = useChatInterface({
    conversationId,
    handleCreateConversation,
    conversationType,
    conversationIdentifier,
    extraBody: getExtraBody(conversationType, conversationIdentifier),
    apiRoute,
    chatConfig: config
  });

  // Get saved messages
  const {
    savedMessagesData,
    isLoading: isLoadingSavedMessages,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage
  } = useSavedMessages({
    loadingConversations: isLoadingConversations,
    conversationId,
    type: conversationType,
    identifier: conversationIdentifier,
    setMessages: chatInterface.setMessages,
    sendSystemMessage: chatInterface.sendSystemMessage
  });

  // const { handleScroll } = useScrollHandling({
  //   containerRef,
  //   messagesData: [], // This needs to be handled properly
  //   hasNextPage: false,
  //   isFetchingNextPage: false,
  //   fetchNextPage: () => Promise.resolve()
  // });

  return (
    <div className='absolute inset-0 flex flex-col overflow-y-auto'>
      <div className={config.chatContainerStyles?.container}>
        {Header && (
          <Header
            conversations={conversations}
            conversationId={conversationId}
            onSelectConversation={setConversationId}
          />
        )}

        {MessagesList && (
          <MessagesList
            messages={chatInterface.messages}
            isLoading={chatInterface.isLoading}
            messagesEndRef={messagesEndRef}
            containerRef={containerRef}
          />
        )}

        {Input && (
          <Input
            input={chatInterface.input}
            handleInputChange={chatInterface.handleInputChange}
            handleSubmit={chatInterface.handleSubmit}
            isLoading={chatInterface.isLoading}
          />
        )}
      </div>
    </div>
  );
}

const getExtraBody = (conversationType: ConversationOwnerType, conversationIdentifier: string) => {
  if (conversationType === CONVERSATION_OWNER_TYPES.PERSON) {
    return {
      personId: conversationIdentifier
    };
  }
  return {};
};
