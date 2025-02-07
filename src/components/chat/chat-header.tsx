'use client';

import { usePathname } from 'next/navigation';

import { ChatRequestOptions, CreateMessage, Message } from 'ai';

import { DefaultChatHeader } from './headers/default';
import { PersonChatHeader } from './headers/person';

interface ChatHeaderProps {
  onAction: (message: string) => void;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

export function ChatHeader({ onAction, append }: ChatHeaderProps) {
  const pathname = usePathname();

  const getHeader = () => {
    const isPersonPage = pathname.startsWith('/app/person/');
    if (isPersonPage) return <PersonChatHeader onAction={onAction} append={append} />;
    return <DefaultChatHeader />;
  };

  return <div className='flex h-12 items-center justify-between border-b px-4'>{getHeader()}</div>;
}
