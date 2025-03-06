import * as React from 'react';
import { redirect } from 'next/navigation';

import { ChatInterfaceWrapper } from '@/components/chat/chat-interface-wrapper';
import { OneRing, ThreeRing, TwoRing } from '@/components/icons';
import { MainContentLayout } from '@/components/layout/main-content-layout';
import { ResizablePanels } from '@/components/layout/resizable-panels';
import { NavUser } from '@/components/nav-user';
import { GlobalSearch } from '@/components/search/global-search';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { createClient } from '@/utils/supabase/server';

export default async function Page({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

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
                <ChatInterfaceWrapper />
              </MainContentLayout>
            </>
          }
          rightPanel={
            <>
              <div className='flex h-12 shrink-0 items-center gap-4 px-2'>
                <div className='ml-auto flex items-center gap-2'>
                  <div className='mr-6 flex items-center gap-2'>
                    <OneRing />
                    <TwoRing />
                    <ThreeRing />
                  </div>
                  <ThemeToggle />
                  <NavUser
                    user={{
                      id: data.user.id,
                      name: 'John Doe',
                      email: 'john.doe@example.com',
                      avatar: 'https://github.com/shadcn.png'
                    }}
                  />
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
