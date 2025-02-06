'use client';

import Link from 'next/link';

import { MoreHorizontal, Plus, Settings, Users } from '@/components/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Group } from '@/types/database';

interface GroupHeaderProps {
  group: Group;
  groupMemberCount: number;
}

export function GroupHeader({ group, groupMemberCount }: GroupHeaderProps) {
  return (
    <div className='flex items-center justify-between px-5 py-2'>
      <div className='flex items-center gap-3'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href='/app/groups' className='flex items-center gap-2 text-muted-foreground'>
                  <Users className='size-4' />
                  <span>Groups</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>{group.name}</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Users className='size-4' />
          <span>{groupMemberCount} members</span>
        </div>
        <Button variant='outline' size='sm'>
          <Plus className='mr-2 size-4' />
          Add People
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              <MoreHorizontal className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem>
              <Settings className='mr-2 size-4' />
              Group Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
