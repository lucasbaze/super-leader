'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CreateGroupSheet } from '@/components/groups/create-group-sheet';
import { Plus, Users } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useGroups } from '@/hooks/use-groups';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';

const RESERVED_SLUGS = Object.values(RESERVED_GROUP_SLUGS);

function GroupIcon({ icon }: { icon?: string | null }) {
  if (!icon) {
    return <Users className='size-4' />;
  }

  return <div className='flex size-4 items-center justify-center text-xs'>{icon}</div>;
}

export function UserGroupsNav() {
  const pathname = usePathname();
  const { data: groups = [], isLoading } = useGroups();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const userGroups = groups.filter((group) => !RESERVED_SLUGS.includes(group.slug));

  if (isLoading || userGroups.length === 0) return null;

  return (
    <>
      <SidebarGroup>
        <div className='relative flex items-center'>
          <SidebarGroupLabel>My Groups</SidebarGroupLabel>
          <SidebarMenuAction asChild>
            <Button
              variant='ghost'
              className='absolute right-0 top-1 size-5'
              onClick={() => setIsSheetOpen(true)}>
              <Plus className='size-4' />
            </Button>
          </SidebarMenuAction>
        </div>
        <SidebarMenu>
          {userGroups.map((group) => {
            const isActive = pathname === `/app/groups/${group.id}`;

            return (
              <SidebarMenuItem key={group.id}>
                <SidebarMenuButton asChild tooltip={group.name} isActive={isActive}>
                  <Link href={`/app/groups/${group.id}`}>
                    <GroupIcon icon={group.icon} />
                    <span>{group.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      {isSheetOpen && <CreateGroupSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />}
    </>
  );
}
