'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { OneRing, ThreeRing, TwoRing } from '@/components/icons';
import { Collapsible } from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { useGroups } from '@/hooks/use-groups';

const CORE_GROUPS = [
  {
    title: 'Inner 5',
    url: '/app/groups/inner-5',
    slug: 'inner-5',
    icon: OneRing
  },
  {
    title: 'Central 50',
    url: '/app/groups/central-50',
    slug: 'central-50',
    icon: TwoRing
  },
  {
    title: 'Strategic 100',
    url: '/app/groups/strategic-100',
    slug: 'strategic-100',
    icon: ThreeRing
  }
];

export function CoreGroupsNav() {
  const pathname = usePathname();
  const [localGroups, setLocalGroups] = useState(CORE_GROUPS);
  const { data: fetchedGroups = [], isLoading } = useGroups();

  // Overwrite the default urls with the actual group ids
  useEffect(() => {
    if (isLoading) return;
    setLocalGroups(
      CORE_GROUPS.map((group) => {
        const matchingCoreGroup = fetchedGroups.find((g) => g.slug === group.slug);
        return {
          ...group,
          url: `/app/groups/${matchingCoreGroup?.id}`
        };
      })
    );
  }, [fetchedGroups]);

  console.log(localGroups);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Core</SidebarGroupLabel>
      <SidebarMenu>
        {localGroups.map((item) => {
          const isActive = pathname === item.url;

          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive}>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
