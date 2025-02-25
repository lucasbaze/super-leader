'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Message as AIMessage, ChatRequestOptions, CreateMessage } from 'ai';
import { ChevronDown, Plus } from 'lucide-react';

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
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
}

export function ChatHeader({
  append,
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation
}: ChatHeaderProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Find the active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const getHeader = () => {
    const isPersonPage = isPath.person(pathname);
    if (isPersonPage) return <PersonChatHeader append={append} />;
    return <DefaultChatHeader />;
  };

  return (
    <div className='flex items-center justify-between border-b p-1'>
      <div className='flex items-center'>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='flex items-center gap-2'>
              <span className='font-medium'>{activeConversation?.name || 'Conversation'}</span>
              <ChevronDown className='size-4' />
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
                {conversation.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={onCreateConversation}>
              <Plus className='mr-2 size-4' />
              New Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='flex items-center gap-2'>{/* Additional header actions can go here */}</div>
    </div>
  );
}
