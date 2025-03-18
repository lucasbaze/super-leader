'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { useConversations, useCreateConversation } from '@/hooks/use-conversations';
import { getConversationTypeIdentifier } from '@/lib/conversations/utils';

import { ChatInterface } from './chat-interface';

export const ChatInterfaceWrapper = () => {
  const pathname = usePathname();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const { type, identifier } = getConversationTypeIdentifier(pathname);

  const createConversation = useCreateConversation();

  // Fetch conversations
  const { data: conversations, isLoading: isLoadingConversations } = useConversations({
    ownerType: type,
    ownerIdentifier: identifier,
    limit: 10
  });

  // Update active conversation when route or conversations change
  useEffect(() => {
    // If conversations are loaded and not empty, set the active conversation to the most recent one
    if (!isLoadingConversations && conversations?.length > 0) {
      // Use the first conversation (assuming they're sorted by recency)
      setActiveConversationId(conversations[0].id);
    } else if (!isLoadingConversations && conversations?.length === 0) {
      // If there is no active conversation and we're not loading, then we'll automatically create a new conversation...
      //TODO: We'll need to "override" the conversation Name later
      handleCreateConversation({ title: 'New Conversation' });
    }
  }, [pathname, conversations, isLoadingConversations]);

  const handleStartNewConversation = useCallback(() => {
    handleCreateConversation({ title: 'New Conversation' });
  }, []);

  // Create a new conversation if none exists
  const handleCreateConversation = useCallback(
    async ({ title }: { title: string }) => {
      const newConversation = await createConversation.mutateAsync({
        name: title,
        ownerType: type,
        ownerIdentifier: identifier
      });
      setActiveConversationId(newConversation.id);
      return newConversation;
    },
    [createConversation, type, identifier]
  );

  // Temporary to reduce moving parts
  if (!activeConversationId) {
    return null;
  }

  return (
    <ChatInterface
      conversationId={activeConversationId}
      conversations={conversations || []}
      isLoadingConversations={isLoadingConversations}
      conversationType={type}
      conversationIdentifier={identifier}
      handleCreateConversation={handleCreateConversation}
      handleStartNewConversation={handleStartNewConversation}
      onSelectConversation={setActiveConversationId}
    />
  );
};

// If there is no active conversation and we're not loading, then we'll automatically create a new conversation...
