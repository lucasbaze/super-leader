'use client';

import * as React from 'react';

import { useMediaQuery } from 'react-responsive';

import { MainContentLayout } from '@/components/layout/main-content-layout';
import { NavUser } from '@/components/nav-user';
import { AnimatedActivity } from '@/components/network/animated-activity';
import { NetworkRings } from '@/components/network/animated-rings';
import { JobsPopover } from '@/components/sidebar/jobs-popover';
import { AnimatedTasks } from '@/components/tasks/animated-tasks';
import { SidebarTrigger } from '@/components/ui/sidebar';

import { GlobalSearch } from '../search/global-search';

interface MainContentWrapperProps {
  children: React.ReactNode;
  userId: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export const MainContentWrapper = ({ children, userId, firstName, lastName, avatar }: MainContentWrapperProps) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <>
      <div className='flex h-12 shrink-0 items-center gap-4 px-2'>
        <div className='flex w-full items-center gap-2'>
          {isMobile ? (
            <>
              <SidebarTrigger className='-ml-1' />
              <div className='flex-1'>
                <GlobalSearch />
              </div>
              <div className='flex items-center gap-2'>
                <JobsPopover userId={userId} />
                <NavUser
                  user={{
                    id: userId,
                    name: `${firstName} ${lastName}`,
                    // email: userProfile?.email || 'john.doe@example.com',
                    avatar: avatar || 'https://github.com/shadcn.png'
                  }}
                />
              </div>
            </>
          ) : (
            <>
              <div className='ml-auto flex items-center gap-2'>
                <AnimatedTasks />
                <AnimatedActivity />
                <NetworkRings />
              </div>
              <JobsPopover userId={userId} />
              <NavUser
                user={{
                  id: userId,
                  name: `${firstName} ${lastName}`,
                  // email: userProfile?.email || 'john.doe@example.com',
                  avatar: avatar || 'https://github.com/shadcn.png'
                }}
              />
            </>
          )}
        </div>
      </div>
      <MainContentLayout>{children}</MainContentLayout>
    </>
  );
};
