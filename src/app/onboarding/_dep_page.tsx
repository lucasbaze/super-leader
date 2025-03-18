'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AlertTriangle } from 'lucide-react';

import { TypingText } from '@/components/animated/typing-text';
import { ChatInput } from '@/components/chat/chat-input';
import { ChatMessage } from '@/components/chat/messages/chat-message';
// import { OnboardingChat } from '@/components/onboarding/onboarding-chat';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useChatInterface } from '@/hooks/chat/use-chat-interface';
import { useInitialMessages } from '@/hooks/chat/use-initial-message';
import { useSavedMessages } from '@/hooks/chat/use-saved-messages';
import { useConversations, useCreateConversation } from '@/hooks/use-conversations';
import { useUserOnboarding } from '@/hooks/use-onboarding';
import { useScrollHandling } from '@/hooks/use-scroll-handling';
import { getConversationTypeIdentifier } from '@/lib/conversations/utils';
import { Conversation } from '@/types/database';

export default function OnboardingPage() {
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { type, identifier } = getConversationTypeIdentifier(pathname);

  const createConversation = useCreateConversation();

  const { onboardingStatus, isLoading: isLoadingOnboarding } = useUserOnboarding();

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
      setConversationId(conversations[0].id);
    } else if (!isLoadingConversations && conversations?.length === 0) {
      // If there is no active conversation and we're not loading, then we'll automatically create a new conversation...
      //TODO: We'll need to "override" the conversation Name later
      handleCreateConversation({ title: 'Onboarding Conversation' });
    }
  }, [pathname, conversations, isLoadingConversations]);

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

  // Check if the user has already completed onboarding
  useEffect(() => {
    if (onboardingStatus?.completed) {
      router.push('/app');
    }
  }, [onboardingStatus, router]);

  if (!conversationId) {
    return null;
  }

  console.log('Conversation ID', conversationId);

  return (
    <OnboardingChat
      conversationId={conversationId}
      handleCreateConversation={handleCreateConversation}
      isLoadingConversations={isLoadingConversations}
      type={type}
      identifier={identifier}
    />
  );
}

interface OnboardingChatProps {
  conversationId: string;
  handleCreateConversation: ({ title }: { title: string }) => Promise<Conversation>;
  isLoadingConversations: boolean;
  type: string;
  identifier: string;
}
const OnboardingChat = ({
  conversationId,
  handleCreateConversation,
  isLoadingConversations,
  type,
  identifier
}: OnboardingChatProps) => {
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const chatInterface = useChatInterface({
    conversationId,
    handleCreateConversation,
    apiRoute: '/api/chat/onboarding'
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
    type,
    identifier,
    setMessages: chatInterface.setMessages,
    sendSystemMessage: chatInterface.sendSystemMessage
  });

  return (
    <div className='px-6'>
      <div className='mx-auto flex max-w-[650px] flex-col gap-2'>
        {/* {error && (
        <Alert variant='destructive' className='z-50 mx-auto mb-4 mt-24 max-w-md'>
          <AlertTriangle className='size-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )} */}
        <h2 className='text-2xl font-bold'>Welcome to Superleader</h2>
        <TypingText text="Let's get started!" />
        {chatInterface.messages.map((message, index) => (
          <ChatMessage
            key={message.id || index}
            message={message}
            isLastMessage={index === chatInterface.messages.length - 1}
            containerRef={messagesContainerRef}
            pendingAction={chatInterface.pendingAction}
            setPendingAction={chatInterface.setPendingAction}
            addToolResult={chatInterface.addToolResult}
            append={chatInterface.append}
            isLoading={chatInterface.isLoading}
          />
        ))}

        <ChatInput
          input={chatInterface.input}
          handleInputChange={chatInterface.handleInputChange}
          handleSubmit={chatInterface.handleSubmit}
          isLoading={chatInterface.isLoading}
        />
      </div>
    </div>
  );
};
