'use client';

import { usePathname } from 'next/navigation';
import { ForwardRefExoticComponent, RefAttributes, useEffect, useRef, useState } from 'react';

import { Message as AIMessage, ChatRequestOptions, CreateMessage } from 'ai';

import { useChatConversations } from '@/hooks/chat/use-chat-conversations';
import { PendingAction, useChatInterface } from '@/hooks/chat/use-chat-interface';
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
  conversations: Conversation[] | undefined;
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  append: (
    message: AIMessage | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  isLoadingConversations: boolean;
  onNewConversation: () => void;
}

export interface MessagesListProps {
  messages: AIMessage[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isLoadingConversations: boolean;
  pendingAction: PendingAction;
  setPendingAction: (action: PendingAction) => void;
  append: (message: CreateMessage) => void;
  addToolResult: (result: { toolCallId: string; result: string }) => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasMore: boolean;
}

interface InputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

interface RenderComponents {
  Header?: React.ComponentType<HeaderProps>;
  MessagesList?: ForwardRefExoticComponent<MessagesListProps & RefAttributes<HTMLDivElement>>;
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

  const { handleScroll } = useScrollHandling({
    containerRef,
    messagesData: savedMessagesData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
  });

  useEffect(() => {
    chatInterface.stop();
  }, [pathname]);

  return (
    <div
      className={cn('absolute inset-0 flex flex-col', config.chatContainerStyles?.outerContainer)}>
      <div className={cn(config.chatContainerStyles?.midContainer)}>
        <div className={cn(config.chatContainerStyles?.innerContainer)}>
          {Header && (
            <Header
              conversations={conversations}
              activeConversationId={conversationId}
              onSelectConversation={setConversationId}
              append={chatInterface.append}
              isLoadingConversations={isLoadingConversations}
              onNewConversation={handleStartNewConversation}
            />
          )}
          <div className={cn('relative flex-1', config.messagesListStyles?.container)}>
            {MessagesList && (
              <MessagesList
                ref={containerRef}
                messages={chatInterface.messages}
                isLoading={chatInterface.isLoading}
                isLoadingConversations={isLoadingConversations}
                append={chatInterface.append}
                onScroll={handleScroll}
                messagesEndRef={messagesEndRef}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
                hasMore={hasNextPage}
                pendingAction={chatInterface.pendingAction}
                setPendingAction={chatInterface.setPendingAction}
                addToolResult={chatInterface.addToolResult}
              />
            )}
            {config.inputStyle === 'inline' && Input && (
              <Input
                input={chatInterface.input}
                handleInputChange={chatInterface.handleInputChange}
                handleSubmit={chatInterface.handleSubmit}
                isLoading={chatInterface.isLoading}
              />
            )}
          </div>

          {config.inputStyle === 'bottom' && Input && (
            <Input
              input={chatInterface.input}
              handleInputChange={chatInterface.handleInputChange}
              handleSubmit={chatInterface.handleSubmit}
              isLoading={chatInterface.isLoading}
            />
          )}
        </div>
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
