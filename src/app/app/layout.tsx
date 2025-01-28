import * as React from 'react';

import { redirect } from 'next/navigation';

import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarLayout, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
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
        <div className='flex h-14 shrink-0 items-center gap-4 px-4'>
          <SidebarTrigger className='-ml-1' />
          <input type='text' placeholder='Search' />
        </div>
        {/* Main Content Area */}
        <div className='flex flex-1'>
          <div
            className={cn(
              'relative flex min-h-svh basis-1/3 flex-col bg-background',
              'min-h-[calc(100svh-theme(spacing.20))] md:m-1 md:rounded-md md:border md:border-slate-200 md:shadow-md'
            )}
          />
          <SidebarInset className='basis-2/3'>
            <header className='flex h-16 shrink-0 items-center gap-2'>
              <div className='flex items-center gap-2 px-4'>
                <Separator orientation='vertical' className='h-4' />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className='hidden md:block'>
                      <BreadcrumbLink href='#'>Building Your Application</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className='hidden md:block' />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className='flex flex-1 flex-col gap-4'>{children}</div>
          </SidebarInset>
        </div>
      </main>
    </SidebarProvider>
  );
}
