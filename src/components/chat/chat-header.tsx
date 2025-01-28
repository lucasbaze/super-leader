'use client';

import { useParams, usePathname, useRouter, useSelectedLayoutSegment } from 'next/navigation';

import { usePerson } from '@/hooks/use-people';

import { ChatHeaderActions } from './chat-header-actions';

interface ChatHeaderProps {
  onAction: (message: string) => void;
}

export function ChatHeader({ onAction }: ChatHeaderProps) {
  const params = useParams();
  const pathname = usePathname();
  const { data: person, isLoading } = usePerson(params.id as string);

  const isPersonPage = pathname.startsWith('/app/person/');

  return (
    <div className='flex items-center justify-between border-b px-4 py-2'>
      <div className='font-semibold'>
        {isPersonPage ? `${person?.first_name} ${person?.last_name}` : 'Chat Assistant'}
      </div>
      <ChatHeaderActions onAction={onAction} />
    </div>
  );
}
