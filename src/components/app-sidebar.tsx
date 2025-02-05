'use client';

import * as React from 'react';

import { User } from '@supabase/supabase-js';

import {
  Bell,
  BookOpen,
  Bot,
  CircleUser,
  Command,
  Frame,
  Home,
  LifeBuoy,
  Map,
  OneRing,
  Orbit,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  ThreeRing,
  TwoRing,
  Users
} from '@/components/icons';
import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import { CoreGroupsNav } from '@/components/sidebar/core-groups-nav';
import { MainNav } from '@/components/sidebar/main-nav';
import { UserGroupsNav } from '@/components/sidebar/user-groups-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';

const mainNavItems = [
  {
    title: 'Home',
    url: '/app',
    icon: Home,
    isActive: true
  },
  {
    title: 'People',
    url: '/app/people',
    icon: CircleUser,
    isActive: false
  },
  {
    title: 'Network',
    url: '/app/network',
    icon: Orbit,
    isActive: false
  },
  {
    title: 'Notifications',
    url: '/app/notifications',
    icon: Bell,
    isActive: false
  }
];

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  core: [
    {
      title: 'Inner 5',
      url: '/app/groups/inner-5',
      icon: OneRing
    },
    {
      title: 'Central 50',
      url: '/app/groups/central-50',
      icon: TwoRing
    },
    {
      title: 'Strategic 100',
      url: '/app/groups/strategic-100',
      icon: ThreeRing
    }
  ],
  navMain: [
    {
      title: '5, 50, 100',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '#'
        },
        {
          title: 'Starred',
          url: '#'
        },
        {
          title: 'Settings',
          url: '#'
        }
      ]
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Genesis',
          url: '#'
        },
        {
          title: 'Explorer',
          url: '#'
        },
        {
          title: 'Quantum',
          url: '#'
        }
      ]
    },
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpen,
      items: [
        {
          title: 'Introduction',
          url: '#'
        },
        {
          title: 'Get Started',
          url: '#'
        },
        {
          title: 'Tutorials',
          url: '#'
        },
        {
          title: 'Changelog',
          url: '#'
        }
      ]
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: '#'
        },
        {
          title: 'Team',
          url: '#'
        },
        {
          title: 'Billing',
          url: '#'
        },
        {
          title: 'Limits',
          url: '#'
        }
      ]
    }
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoy
    },
    {
      title: 'Feedback',
      url: '#',
      icon: Send
    }
  ]
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  // Transform Supabase user data to match the expected format for NavUser
  const userData = user
    ? {
        name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar: user.user_metadata?.avatar_url || ''
      }
    : data.user;

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
        <CoreGroupsNav items={data.core} />
        <UserGroupsNav />
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
