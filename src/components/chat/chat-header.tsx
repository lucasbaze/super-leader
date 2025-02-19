'use client';

import { usePathname } from 'next/navigation';

import { ChatRequestOptions, CreateMessage, Message } from 'ai';

import { isPath } from '@/lib/routes';

import { DefaultChatHeader } from './headers/default';
import { PersonChatHeader } from './headers/person';

interface ChatHeaderProps {
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

export function ChatHeader({ append }: ChatHeaderProps) {
  const pathname = usePathname();

  const getHeader = () => {
    const isPersonPage = isPath.person(pathname);
    if (isPersonPage) return <PersonChatHeader append={append} />;
    return <DefaultChatHeader />;
  };

  return <div className='flex h-12 items-center justify-between border-b px-4'>{getHeader()}</div>;
}
