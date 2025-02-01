'use client';

import { useParams, usePathname } from 'next/navigation';

import { Plus } from '@/components/icons';
import { Button } from '@/components/ui/button';

interface ChatHeaderActionsProps {
  onAction: (message: string) => void;
}

export function ChatHeaderActions({ onAction }: ChatHeaderActionsProps) {
  const pathname = usePathname();
  const params = useParams();

  // Check if we're on a person page
  const isPersonPage = pathname.startsWith('/app/person/');

  if (!isPersonPage) {
    return null;
  }

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='ghost'
        size='icon'
        onClick={() =>
          onAction(`Create a new note for this person (ID: ${params.id}): 
          
          `)
        }
        title='Create new note'>
        <Plus className='size-4' />
      </Button>
    </div>
  );
}
