import * as React from 'react';
import { redirect } from 'next/navigation';

import { MainChat } from '@/components/chat/main/main-chat';
import { MainContentLayout } from '@/components/layout/main-content-layout';
import { MainContentWrapper } from '@/components/layout/main-content-wrapper';
import { MobileResponsiveLayout } from '@/components/layout/mobile-responsive-layout';
import { SidebarRouteListener } from '@/components/layout/sidebar-route-listener';
import { GlobalSearch } from '@/components/search/global-search';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
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
      <SidebarRouteListener />
      <AppSidebar user={data.user} />
      <main className='flex flex-1 flex-col pr-2'>
        <MobileResponsiveLayout
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
              <MainContentWrapper
                userId={data.user.id}
                firstName={userProfile?.first_name || ''}
                lastName={userProfile?.last_name || ''}
                avatar={userProfile?.avatar || ''}>
                {children}
              </MainContentWrapper>
            </>
          }
        />
      </main>
    </SidebarProvider>
  );
}
