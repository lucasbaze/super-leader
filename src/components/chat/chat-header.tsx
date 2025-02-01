'use client';

import { useParams, usePathname, useRouter, useSelectedLayoutSegment } from 'next/navigation';

import { Activity } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { usePerson } from '@/hooks/use-people';
import { ChatHeaderActions } from './chat-header-actions';


interface ChatHeaderProps {
  onAction: (message: string) => void;
  onSuggestions: () => Promise<any>;
}

export function ChatHeader({ onAction, onSuggestions }: ChatHeaderProps) {
  const params = useParams();
  const pathname = usePathname();
  const { data: person, isLoading } = usePerson(params.id as string);

  const isPersonPage = pathname.startsWith('/app/person/');

  return (
    <div className='flex items-center justify-between border-b px-4 py-1'>
      <div className='font-semibold'>
        {isPersonPage ? `${person?.first_name} ${person?.last_name}` : 'Chat Assistant'}
      </div>

      <Button variant='ghost' size='icon' onClick={() => onSuggestions()} title='Create new note'>
        <Activity className='size-4' />
      </Button>
      <ChatHeaderActions onAction={onAction} />
    </div>
  );
}
