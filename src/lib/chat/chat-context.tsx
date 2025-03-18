'use client';

import { createContext, useContext } from 'react';

import { type ChatConfig } from './types/chat-config';

interface ChatContextValue {
  config: ChatConfig;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatConfigProviderProps {
  config: ChatConfig;
  children: React.ReactNode;
}

export function ChatConfigProvider({ config, children }: ChatConfigProviderProps) {
  return <ChatContext.Provider value={{ config }}>{children}</ChatContext.Provider>;
}

export function useChatConfig() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatConfig must be used within a ChatConfigProvider');
  }
  return context;
}
