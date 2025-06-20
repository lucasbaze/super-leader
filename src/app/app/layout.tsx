import * as React from 'react';
import { redirect } from 'next/navigation';

import { MainChat } from '@/components/chat/main/main-chat';
import { MainContentLayout } from '@/components/layout/main-content-layout';
import { ResizablePanels } from '@/components/layout/resizable-panels';
import { NavUser } from '@/components/nav-user';
import { AnimatedActivity } from '@/components/network/animated-activity';
import { NetworkRings } from '@/components/network/animated-rings';
import { GlobalSearch } from '@/components/search/global-search';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { JobsPopover } from '@/components/sidebar/jobs-popover';
import { AnimatedTasks } from '@/components/tasks/animated-tasks';
// import { ThemeToggle } from '@/components/theme/theme-toggle';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { createClient } from '@/utils/supabase/server';

export default async function Page({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  const { data: userProfile, error: userProfileError } = await supabase
    .from('user_profile')
    .select('*')
    .eq('user_id', data.user.id)
    .single();

  // if (userProfileError) {
  //   redirect('/onboarding');
  // }

  // if (!userProfile?.onboarding?.completed) {
  //   redirect('/onboarding');
  // }

  return (
    <SidebarProvider>
      <AppSidebar user={data.user} />
      <main className='flex flex-1 flex-col pr-2'>
        <ResizablePanels
          leftPanel={
            <>
              <div className='flex h-12 shrink-0 items-center gap-4 pl-2 pr-1'>
                <SidebarTrigger className='-ml-1' />
                <div className='m-auto flex-1'>
                  <GlobalSearch />
                </div>
              </div>
              <MainContentLayout>
                <MainChat />
              </MainContentLayout>
            </>
          }
          rightPanel={
            <>
              <div className='flex h-12 shrink-0 items-center gap-4 px-2'>
                <div className='flex w-full items-center justify-end gap-2'>
                  <div className='ml-auto flex items-center gap-2'>
                    <AnimatedTasks />
                    <AnimatedActivity />
                    <NetworkRings />
                  </div>
                  <div className='flex items-center gap-2'>
                    <JobsPopover userId={data.user.id} />
                    {/* <ThemeToggle /> */}
                    <NavUser
                      user={{
                        id: data.user.id,
                        name: `${userProfile?.first_name} ${userProfile?.last_name}`,
                        // email: userProfile?.email || 'john.doe@example.com',
                        avatar: userProfile?.avatar || 'https://github.com/shadcn.png'
                      }}
                    />
                  </div>
                </div>
              </div>
              <MainContentLayout>{children}</MainContentLayout>
            </>
          }
        />
      </main>
    </SidebarProvider>
  );
}
