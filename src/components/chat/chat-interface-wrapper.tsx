'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { useConversations, useCreateConversation } from '@/hooks/use-conversations';

import { ChatInterface } from './chat-interface';
import { getChatRoute, getChatType } from './utils';

export const ChatInterfaceWrapper = () => {
  const pathname = usePathname();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Fetch conversations
  const { data: conversations, isLoading: isLoadingConversations } = useConversations({
    limit: 10
  });

  // Create a new conversation if needed
  const createConversation = useCreateConversation({
    onSuccess: (data) => {
      setActiveConversationId(data.id);
    }
  });

  // Set the active conversation to the most recent one if not already set
  if (!isLoadingConversations && conversations?.length > 0 && !activeConversationId) {
    setActiveConversationId(conversations[0].id);
  }

  // Create a new conversation if none exists
  const handleCreateConversation = () => {
    createConversation.mutate({ name: 'New Conversation' });
  };

  return (
    <ChatInterface
      conversationId={activeConversationId}
      conversations={conversations || []}
      isLoadingConversations={isLoadingConversations}
      onCreateConversation={handleCreateConversation}
      onSelectConversation={setActiveConversationId}
      chatType={getChatType(pathname)}
      chatRoute={getChatRoute(pathname)}
    />
  );
};
