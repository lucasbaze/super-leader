'use client';

import { useState } from 'react';

import { useConversations, useCreateConversation } from '@/hooks/use-conversations';

import { ChatInterface } from './chat-interface';

export const ChatInterfaceWrapper = () => {
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
    />
  );
};
