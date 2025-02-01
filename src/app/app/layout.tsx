import { redirect } from 'next/navigation';
import * as React from 'react';


import { AppSidebar } from '@/components/app-sidebar';
import { ChatInterface } from '@/components/chat/chat-interface';
import { OneRing, ThreeRing, TwoRing } from '@/components/icons';
import { MainContentLayout } from '@/components/layout/main-content-layout';
import { ResizablePanels } from '@/components/layout/resizable-panels';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
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
      <main className='flex flex-1 flex-col'>
        <div className='flex h-12 shrink-0 items-center gap-4 px-2'>
          <SidebarTrigger className='-ml-1' />
          <div className='m-auto flex-1 basis-1/3'>
            <Input className='rounded-full border bg-background md:max-w-sm' type='text' placeholder='Search' />
          </div>
          <div className='ml-auto flex items-center gap-2'>
            <OneRing />
            <TwoRing />
            <ThreeRing />
            <ThemeToggle />
            <Avatar className='size-8'>
              <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
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
