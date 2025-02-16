import * as React from 'react';
import { redirect } from 'next/navigation';

import { ChatInterface } from '@/components/chat/chat-interface';
import { OneRing, ThreeRing, TwoRing } from '@/components/icons';
import { MainContentLayout } from '@/components/layout/main-content-layout';
import { ResizablePanels } from '@/components/layout/resizable-panels';
import { NavUser } from '@/components/nav-user';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Input } from '@/components/ui/input';
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
        <div className='flex h-12 shrink-0 items-center gap-4 px-2'>
          <SidebarTrigger className='-ml-1' />
          <div className='m-auto flex-1 basis-1/3'>
            <Input
              className='rounded-full border bg-background md:max-w-sm'
              type='text'
              placeholder='Search'
            />
          </div>
          <div className='ml-auto flex items-center gap-2'>
            <div className='mr-6 flex items-center gap-2'>
              <OneRing />
              <TwoRing />
              <ThreeRing />
            </div>
            <ThemeToggle />
            <NavUser
              user={{
                name: 'John Doe',
                email: 'john.doe@example.com',
                avatar: 'https://github.com/shadcn.png'
              }}
            />
          </div>
        </div>

        <ResizablePanels
          leftPanel={
            <MainContentLayout>
              <ChatInterface />
            </MainContentLayout>
          }
          rightPanel={<MainContentLayout>{children}</MainContentLayout>}
        />
      </main>
    </SidebarProvider>
  );
}
