'use client';

import * as React from 'react';

import { User } from '@supabase/supabase-js';

import { Bookmark, CircleUser, Command, Home, LandPlot, Orbit } from '@/components/icons';
import { CoreGroupsNav } from '@/components/sidebar/core-groups-nav';
import { MainNav } from '@/components/sidebar/main-nav';
import { UserGroupsNav } from '@/components/sidebar/user-groups-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { ROUTES } from '@/lib/routes';

const mainNavItems = [
  {
    title: 'Home',
    url: ROUTES.HOME,
    icon: Home,
    isActive: true
  },
  {
    title: 'People',
    url: ROUTES.PEOPLE,
    icon: CircleUser,
    isActive: false
  },
  {
    title: 'Network',
    url: ROUTES.NETWORK,
    icon: Orbit,
    isActive: false
  },
  {
    title: 'Saved',
    url: ROUTES.BOOKMARKS,
    icon: Bookmark,
    isActive: false
  },
  {
    title: 'Goals',
    url: ROUTES.CONTEXT,
    icon: LandPlot,
    isActive: false
  }
];

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  }
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible='icon' variant='inset' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <a href='#'>
                <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
                  <Command className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>Superleader</span>
                  <span className='truncate text-xs'>Go forth and build</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <MainNav items={mainNavItems} />
        <CoreGroupsNav />
        <UserGroupsNav />
      </SidebarContent>
    </Sidebar>
  );
}
