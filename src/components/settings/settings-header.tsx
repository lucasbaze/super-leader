'use client';

import { BaseHeader } from '@/components/headers/base-header';
import { ListFilter, MoreHorizontal, Users } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface SettingsHeaderProps {
  title?: string;
}

export function SettingsHeader({ title }: SettingsHeaderProps) {
  return (
    <BaseHeader className='flex flex-1 items-center justify-between'>
      <div className='flex items-center gap-3'>
        <h2 className='text-md font-semibold text-muted-foreground'>Settings</h2>
        {/* <Button variant='outline' size='sm'>
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
        </DropdownMenu> */}
      </div>

      {/* <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Users className='size-4' />
          <span>{peopleCount} people</span>
        </div>
      </div> */}
    </BaseHeader>
  );
}
