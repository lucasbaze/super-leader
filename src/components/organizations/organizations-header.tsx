'use client';

import { BaseHeader } from '@/components/headers/base-header';
import { Building2, ListFilter, MoreHorizontal } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface OrganizationsHeaderProps {
  organizationsCount: number;
}

export function OrganizationsHeader({ organizationsCount }: OrganizationsHeaderProps) {
  return (
    <BaseHeader className='flex flex-1 items-center justify-between'>
      <div className='flex items-center gap-3'>
        <h2 className='text-md font-semibold text-muted-foreground'>Organizations</h2>
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
          <Building2 className='size-4' />
          <span>{organizationsCount} organizations</span>
        </div>
      </div>
    </BaseHeader>
  );
}
