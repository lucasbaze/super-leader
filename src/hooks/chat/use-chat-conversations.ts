import { useCallback, useEffect, useState } from 'react';

import { getConversationTypeIdentifier } from '@/lib/conversations/utils';

import { useConversations, useCreateConversation } from '../use-conversations';

interface UseChatConversationsProps {
  pathname: string;
}

export function useChatConversations({ pathname }: UseChatConversationsProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { type, identifier } = getConversationTypeIdentifier(pathname);
  const createConversation = useCreateConversation();

  const { data: conversations, isLoading: isLoadingConversations } = useConversations({
    ownerType: type,
    ownerIdentifier: identifier,
    limit: 10
  });

  // Create a new conversation if none exists
  const handleCreateConversation = useCallback(
    async ({ title }: { title: string }) => {
      const newConversation = await createConversation.mutateAsync({
        name: title,
        ownerType: type,
        ownerIdentifier: identifier
      });
      setConversationId(newConversation.id);
      return newConversation;
    },
    [createConversation, type, identifier]
  );

  const handleStartNewConversation = useCallback(() => {
    handleCreateConversation({ title: 'New Conversation' });
  }, []);

  // Update active conversation when route or conversations change
  useEffect(() => {
    // If conversations are loaded and not empty, set the active conversation to the most recent one
    if (!isLoadingConversations && conversations?.length > 0) {
      // Use the first conversation (assuming they're sorted by recency)
      setConversationId(conversations[0].id);
    } else if (!isLoadingConversations && conversations?.length === 0) {
      // If there is no active conversation and we're not loading, then we'll automatically create a new conversation...
      //TODO: We'll need to "override" the conversation Name later
      handleCreateConversation({ title: 'Onboarding Conversation' });
    }
  }, [pathname, conversations, isLoadingConversations]);

  return {
    conversationId,
    conversations,
    isLoadingConversations,
    handleCreateConversation,
    handleStartNewConversation,
    conversationType: type,
    conversationIdentifier: identifier,
    setConversationId
  };
}
