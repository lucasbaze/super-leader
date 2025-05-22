'use client';

import * as React from 'react';

import { User } from '@supabase/supabase-js';

import { Bookmark, CircleUser, Command, Home, Hotel, Orbit, Users } from '@/components/icons';
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

import { Logo } from '../icons/custom/logo';

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
    icon: Users,
    isActive: false
  },
  {
    title: 'Network',
    url: ROUTES.NETWORK,
    icon: Orbit,
    isActive: false
  },
  {
    title: 'Orgs',
    url: ROUTES.ORGANIZATIONS,
    icon: Hotel,
    isActive: false
  },
  // {
  //   title: 'Saved',
  //   url: ROUTES.BOOKMARKS,
  //   icon: Bookmark,
  //   isActive: false
  // },
  {
    title: 'Profile',
    url: ROUTES.CONTEXT,
    icon: CircleUser,
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
                  <Logo className='size-6' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-semibold'>Superleader</span>
                  <span className='truncate text-xs'>Go forth together</span>
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
