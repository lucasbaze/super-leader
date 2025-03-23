'use client';

import { usePathname } from 'next/navigation';

import { BaseChatInterface } from '@/components/chat/base-chat-interface';
import { ChatConfigProvider } from '@/lib/chat/chat-context';
import { ChatTools } from '@/lib/chat/chat-tools';
import { CHAT_TOOLS } from '@/lib/chat/tools/constants';
import { type ChatConfig } from '@/lib/chat/types/chat-config';
import { getConversationTypeIdentifier } from '@/lib/conversations/utils';

import { ChatHeader } from '../chat-header';
import { ChatInput } from '../chat-input';
import { MainMessagesList } from './main-messages-list';

const mainConfig: ChatConfig = {
  type: 'main',
  toolRegistry: ChatTools,
  chatContainerStyles: {
    outerContainer: '',
    midContainer: '',
    innerContainer: 'absolute inset-0 flex flex-col'
  },
  messageStyles: {
    assistant: 'max-w-[90%] break-words rounded-sm bg-muted px-3 py-2 text-sm',
    container: 'bg-transparent',
    user: 'max-w-[90%] break-words rounded-sm bg-gradient-to-r from-primary to-blue-500 px-3 py-2 text-sm text-primary-foreground',
    toolCall: 'bg-transparent w-full'
  },
  inputStyle: 'bottom',
  hiddenTools: [CHAT_TOOLS.GET_INITIAL_MESSAGE]
};

export function MainChat() {
  const pathname = usePathname();
  const { type, identifier } = getConversationTypeIdentifier(pathname);

  return (
    <ChatConfigProvider config={mainConfig}>
      <BaseChatInterface
        components={{
          Header: ChatHeader,
          MessagesList: MainMessagesList,
          Input: ChatInput
        }}
        conversationType={type}
        conversationIdentifier={identifier}
        apiRoute='/api/chat'
      />
    </ChatConfigProvider>
  );
}
