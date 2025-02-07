'use client';

import Link from 'next/link';
import { useState } from 'react';

import { AddPeopleSheet } from '@/components/groups/add-people-sheet';
import { DeleteGroupDialog } from '@/components/groups/delete-group-dialog';
import { EditGroupSheet } from '@/components/groups/edit-group-sheet';
import { MoreHorizontal, Settings, Trash, UserPlus, Users } from '@/components/icons';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { Group } from '@/types/database';

interface GroupHeaderProps {
  group: Group;
  groupMemberCount: number;
}

export function GroupHeader({ group, groupMemberCount }: GroupHeaderProps) {
  const [isAddPeopleOpen, setIsAddPeopleOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);

  const isReservedGroup = Object.values(RESERVED_GROUP_SLUGS).includes(group.slug);

  return (
    <>
      <div className='flex items-center justify-between px-5 py-2'>
        <div className='flex items-center gap-3'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href='/app/groups'
                    className='flex items-center gap-2 text-muted-foreground'>
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
          <Button variant='outline' size='sm' onClick={() => setIsAddPeopleOpen(true)}>
            <UserPlus className='mr-2 size-4' />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm'>
                <MoreHorizontal className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => setIsEditGroupOpen(true)}>
                <Settings className='mr-2 size-4' />
                Edit Group
              </DropdownMenuItem>
              {!isReservedGroup && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='text-destructive focus:bg-destructive focus:text-destructive-foreground'
                    onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash className='mr-2 size-4' />
                    Delete Group
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AddPeopleSheet
        groupId={group.id}
        groupSlug={group.slug}
        open={isAddPeopleOpen}
        onOpenChange={setIsAddPeopleOpen}
      />

      <EditGroupSheet group={group} open={isEditGroupOpen} onOpenChange={setIsEditGroupOpen} />

      <DeleteGroupDialog
        groupId={group.id}
        groupName={group.name}
        memberCount={groupMemberCount}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      />
    </>
  );
}
