'use client';

import { ListFilter, MoreHorizontal, Users } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface PeopleHeaderProps {
  peopleCount: number;
}

export function PeopleHeader({ peopleCount }: PeopleHeaderProps) {
  return (
    <div className='flex items-center justify-between px-5 py-2'>
      <div className='flex items-center gap-3'>
        <h2 className='text-lg font-semibold'>People</h2>
        <Button variant='outline' size='sm'>
          <ListFilter className='mr-2 size-4' />
          Filter
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              <MoreHorizontal className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem>
              <ListFilter className='mr-2 size-4' />
              Sort
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Users className='size-4' />
          <span>{peopleCount} people</span>
        </div>
      </div>
    </div>
  );
}
