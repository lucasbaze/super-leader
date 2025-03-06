'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Message as AIMessage, ChatRequestOptions, CreateMessage } from 'ai';

import { History, Loader, Plus } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { isPath } from '@/lib/routes';

import { DefaultChatHeader } from './headers/default';
import { PersonChatHeader } from './headers/person';

interface ChatHeaderProps {
  append: (
    message: AIMessage | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
  conversations: any[];
  activeConversationId: string;
  isLoadingConversations: boolean;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export function ChatHeader({
  append,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  isLoadingConversations
}: ChatHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const getHeader = () => {
    const isPersonPage = isPath.person(pathname);
    if (isPersonPage)
      return <PersonChatHeader append={append} conversationId={activeConversationId} />;
    return <DefaultChatHeader />;
  };

  return (
    <div className='flex h-12 items-center border-b p-1'>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' size='icon' className='mr-2 flex items-center gap-2'>
            {isLoadingConversations ? (
              <Loader className='size-4 animate-spin' />
            ) : (
              <History className='size-4' />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='w-56'>
          {conversations.map((conversation) => (
            <DropdownMenuItem
              key={conversation.id}
              className={`${conversation.id === activeConversationId ? 'bg-muted' : ''}`}
              onClick={() => {
                onSelectConversation(conversation.id);
                setIsOpen(false);
              }}>
              <span className='truncate'>{conversation.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={onNewConversation}>
            <Plus className='mr-2 size-4' />
            New Conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className='flex items-center gap-2'>{getHeader()}</div>
    </div>
  );
}
