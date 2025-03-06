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

  // Fetch conversations
  const { data: conversations, isLoading: isLoadingConversations } = useConversations({
    ownerType: type,
    ownerIdentifier: identifier,
    limit: 10
  });

  // Update active conversation when route or conversations change
  useEffect(() => {
    // Reset active conversation when route changes
    setActiveConversationId(null);

    // If conversations are loaded and not empty, set the active conversation to the most recent one
    if (!isLoadingConversations && conversations?.length > 0) {
      // Use the first conversation (assuming they're sorted by recency)
      setActiveConversationId(conversations[0].id);
    }
  }, [pathname, conversations, isLoadingConversations]);

  // Create a new conversation if needed
  const createConversation = useCreateConversation({
    onSuccess: (data) => {
      setActiveConversationId(data.id);
    }
  });

  const handleStartNewConversation = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  // Create a new conversation if none exists
  const handleCreateConversation = useCallback(
    async ({ title }: { title: string }) => {
      const newConversation = await createConversation.mutateAsync({
        name: title,
        ownerType: type,
        ownerIdentifier: identifier
      });
      return newConversation;
    },
    [createConversation, type, identifier]
  );

  return (
    <ChatInterface
      conversationId={activeConversationId}
      conversations={conversations || []}
      isLoadingConversations={isLoadingConversations}
      handleCreateConversation={handleCreateConversation}
      handleStartNewConversation={handleStartNewConversation}
      onSelectConversation={setActiveConversationId}
    />
  );
};
