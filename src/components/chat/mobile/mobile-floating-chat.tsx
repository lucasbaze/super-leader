'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { BaseChatInterface } from '@/components/chat/base-chat-interface';
import { ChatHeader } from '@/components/chat/chat-header';
import { ChatInput } from '@/components/chat/chat-input';
import { MainMessagesList } from '@/components/chat/main/main-messages-list';
import { MessageCircle, SendHorizontal, X } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ChatConfigProvider } from '@/lib/chat/chat-context';
import { ChatTools } from '@/lib/chat/chat-tools';
import { CHAT_TOOLS } from '@/lib/chat/tools/constants';
import { type ChatConfig } from '@/lib/chat/types/chat-config';
import { getConversationTypeIdentifier } from '@/lib/conversations/utils';
import { cn } from '@/lib/utils';

const mobileConfig: ChatConfig = {
  type: 'main',
  toolRegistry: ChatTools,
  chatContainerStyles: {
    outerContainer: 'flex flex-col h-full',
    midContainer: 'flex flex-col h-full',
    innerContainer: 'flex flex-col h-full'
  },
  messageStyles: {
    assistant: 'max-w-[90%] break-words rounded-sm bg-sidebar px-3 py-2 text-sm',
    container: 'bg-transparent',
    user: 'max-w-[90%] break-words rounded-sm bg-gradient-to-r from-primary to-blue-500 px-3 py-2 text-sm text-primary-foreground',
    toolCall: 'bg-transparent w-full'
  },
  inputStyle: 'bottom',
  hiddenTools: [CHAT_TOOLS.GET_INITIAL_MESSAGE]
};

export function MobileFloatingChat() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const pathname = usePathname();
  const { type, identifier } = getConversationTypeIdentifier(pathname);
  const expandedRef = useRef<HTMLDivElement>(null);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setHasNewMessages(false);
    }
  };

  const closeChat = () => {
    setIsExpanded(false);
  };

  // Close chat when clicking outside (disabled for now to prevent issues)
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (expandedRef.current && !expandedRef.current.contains(event.target as Node)) {
  //       closeChat();
  //     }
  //   };

  //   if (isExpanded) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //   }

  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [isExpanded]);

  // Handle escape key to close chat
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        closeChat();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isExpanded]);

  return (
    <>
      {/* Backdrop */}
      {isExpanded && <div className='fixed inset-0 z-[60] bg-black/50 md:hidden' />}

      {/* Floating Chat Input Bar */}
      {!isExpanded && (
        <div className='fixed bottom-4 left-4 right-4 z-50 md:hidden'>
          <div
            onClick={toggleExpanded}
            className={cn(
              'flex items-center gap-3 rounded-lg border bg-background p-4 shadow-lg transition-all duration-200',
              'cursor-pointer hover:shadow-xl',
              hasNewMessages && 'animate-pulse'
            )}>
            <MessageCircle className='h-5 w-5 text-muted-foreground' />
            <span className='flex-1 text-sm text-muted-foreground'>Send a message...</span>
            <div className='flex h-8 w-8 items-center justify-center rounded-sm bg-gradient-to-r from-primary to-blue-500'>
              <SendHorizontal className='h-4 w-4 text-white' />
            </div>
          </div>
        </div>
      )}

      {/* Expanded Chat Interface */}
      {isExpanded && (
        <div
          ref={expandedRef}
          className='fixed inset-4 z-[70] flex flex-col rounded-lg bg-background shadow-2xl md:hidden'>
          {/* Header with close button */}
          <div className='flex items-center justify-between border-b p-4'>
            <h2 className='text-lg font-semibold'>Chat Assistant</h2>
            <Button variant='ghost' size='icon' onClick={closeChat} className='h-8 w-8'>
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Chat Interface */}
          <div className='relative flex-1 overflow-hidden'>
            <ChatConfigProvider config={mobileConfig}>
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
          </div>
        </div>
      )}
    </>
  );
}
