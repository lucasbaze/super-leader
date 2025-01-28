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
                <SidebarInset>
                    <header className='flex h-16 shrink-0 items-center gap-2'>
                        <div className='flex items-center gap-2 px-4'>
                            <SidebarTrigger className='-ml-1' />
                            <Separator orientation='vertical' className='mr-2 h-4' />
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
                    <div className='flex flex-1 flex-col gap-4'>
                        {children}
                        {/* <div className='grid auto-rows-min gap-4 md:grid-cols-3'>
                        <div className='aspect-video rounded-xl bg-muted/50' />
                        <div className='aspect-video rounded-xl bg-muted/50' />
                        <div className='aspect-video rounded-xl bg-muted/50' />
                    </div>
                    <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min' /> */}
                    </div>
                </SidebarInset>
            </main>
        </SidebarProvider>
    );
}
