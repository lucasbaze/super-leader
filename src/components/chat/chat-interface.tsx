'use client';

import { useEffect, useRef } from 'react';

import { useChatInterface } from '@/hooks/chat/use-chat-interface';
import { useSavedMessages } from '@/hooks/chat/use-saved-messages';
import { useScrollHandling } from '@/hooks/use-scroll-handling';
import { CHAT_TYPE, ChatType } from '@/lib/chat/utils';

import { ChatHeader } from './chat-header';
import { ChatInput } from './chat-input';
import { ChatMessagesList } from './chat-messages-list';

interface ChatInterfaceProps {
  conversationId: string | null;
  conversations: any[];
  isLoadingConversations: boolean;
  onCreateConversation: () => void;
  onSelectConversation: (id: string) => void;
}

export function ChatInterface({
  conversationId,
  conversations,
  isLoadingConversations,
  onCreateConversation,
  onSelectConversation
}: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  // Set up chat interface
  const chatInterface = useChatInterface({
    apiEndpoint: '/api/chat',
    conversationId
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

  // Track if we've already sent the initial message for this session
  const hasInitializedContextChat = useRef(false);

  // useEffect(() => {
  //   // Only run this once when the component mounts with context chat type
  //   // and we haven't already initialized this session
  //   if (
  //     chatType === CHAT_TYPE.CONTEXT &&
  //     !isLoadingConversations &&
  //     conversationId &&
  //     !isLoading &&
  //     !hasInitializedContextChat.current
  //   ) {
  //     // Mark that we've initialized the context chat for this session
  //     hasInitializedContextChat.current = true;

  //     // Send the system message to trigger the initial context
  //     chatInterface.append({
  //       role: 'system',
  //       content: 'Call the `getInitialContext` tool to get started.'
  //     });

  //     // Send a user message to start the conversation
  //     chatInterface.append({
  //       role: 'user',
  //       content: 'Please ask me a question to get started.'
  //     });
  //   }
  // }, [chatType, isLoadingConversations, conversationId, chatInterface, isLoading]);

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
