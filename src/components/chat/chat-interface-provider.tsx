'use client';

import { usePathname } from 'next/navigation';

import { useChatInterface } from '@/hooks/use-chat-interface';
import { createChatParams } from '@/lib/chat/chat-params-factory';

import { ChatInterface } from './chat-interface';

// Setting up as a provider pattern for later...
export const ChatInterfaceProvider = () => {
  const pathname = usePathname();

  // Create standardized chat parameters
  const chatParams = createChatParams(pathname);

  // Set up chat interface
  // const chatInterface = useChatInterface({
  //   apiEndpoint: '/api/chat/context',
  //   chatParams
  // });

  return <ChatInterface />;
};
