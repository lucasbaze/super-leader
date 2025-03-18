'use client';

import { BaseChatInterface } from '@/components/chat/base-chat-interface';
import { ChatConfigProvider } from '@/lib/chat/chat-context';
import { ChatTools } from '@/lib/chat/onboarding-chat-tools';
import { type ChatConfig } from '@/lib/chat/types/chat-config';

import { OnboardingChatInput } from './onboarding-chat-input';
import { OnboardingHeader } from './onboarding-header';
import { OnboardingMessagesList } from './onboarding-messages-list';

const onboardingConfig: ChatConfig = {
  type: 'onboarding',
  toolRegistry: ChatTools,
  chatContainerStyles: {
    container: 'min-w-2xl max-w-2xl mx-auto py-12'
  },
  messageStyles: {
    assistant: 'font-medium text-foreground',
    container: 'bg-transparent',
    user: 'font-medium',
    toolCall: 'bg-transparent'
  },
  inputStyle: 'inline',
  hiddenTools: ['getInitialMessage']
};

export function OnboardingChat() {
  return (
    <ChatConfigProvider config={onboardingConfig}>
      <BaseChatInterface
        components={{
          Header: OnboardingHeader,
          MessagesList: OnboardingMessagesList,
          Input: OnboardingChatInput
        }}
        conversationType='route'
        conversationIdentifier='onboarding'
        apiRoute='/api/chat/onboarding'
      />
    </ChatConfigProvider>
  );
}
