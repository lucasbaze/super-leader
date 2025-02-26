'use client';

import { useState } from 'react';

import { AddPeopleSheet } from '@/components/groups/add-people-sheet';
import { DeleteGroupDialog } from '@/components/groups/delete-group-dialog';
import { EditGroupSheet } from '@/components/groups/edit-group-sheet';
import { BaseHeader } from '@/components/headers/base-header';
import { MoreHorizontal, Settings, Trash, UserPlus, Users } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';
import { IconMap } from '@/lib/ui/icon-map';
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
    <BaseHeader className='flex flex-1 justify-between'>
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <span>{IconMap[group.icon] ? IconMap[group.icon]({ size: 4 }) : group.icon}</span>
          <h1 className='text-md font-semibold text-muted-foreground'>{group.name}</h1>
        </div>
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
    </BaseHeader>
  );
}
