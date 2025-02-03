'use client';

import { usePathname } from 'next/navigation';

import { DefaultChatHeader } from './headers/default';
import { PersonChatHeader } from './headers/person';

interface ChatHeaderProps {
  onAction: (message: string) => void;
  onSuggestions: () => Promise<any>;
}

export function ChatHeader({ onAction, onSuggestions }: ChatHeaderProps) {
  const pathname = usePathname();

  const getHeader = () => {
    const isPersonPage = pathname.startsWith('/app/person/');
    if (isPersonPage) return <PersonChatHeader onAction={onAction} onSuggestions={onSuggestions} />;
    return <DefaultChatHeader />;
  };

  return <div className='flex h-12 items-center justify-between border-b px-4'>{getHeader()}</div>;
}
