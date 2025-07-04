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
        <div className='flex w-full items-center justify-end gap-2'>
          {isMobile ? (
            <div className='mr-auto flex items-center gap-2'>
              <SidebarTrigger className='-ml-1' />
            </div>
          ) : (
            <div className='ml-auto flex items-center gap-2'>
              <AnimatedTasks />
              <AnimatedActivity />
              <NetworkRings />
            </div>
          )}
          <div className='flex items-center gap-2'>
            <JobsPopover userId={userId} />
            {/* <ThemeToggle /> */}
            <NavUser
              user={{
                id: userId,
                name: `${firstName} ${lastName}`,
                // email: userProfile?.email || 'john.doe@example.com',
                avatar: avatar || 'https://github.com/shadcn.png'
              }}
            />
          </div>
        </div>
      </div>
      <MainContentLayout>{children}</MainContentLayout>
    </>
  );
};
