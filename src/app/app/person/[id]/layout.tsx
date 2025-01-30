'use client';

import Link from 'next/link';
import { useParams, useRouter, useSelectedLayoutSegment } from 'next/navigation';

import { Users } from '@/components/icons';
import { PersonBioSidebar } from '@/components/person/bio-sidebar';
import { PersonHeader } from '@/components/person/person-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePerson } from '@/hooks/use-people';
import { usePersonAbout } from '@/hooks/use-person-about';

export default function PersonLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const segment = useSelectedLayoutSegment() || 'summary';
  const { data: person, isLoading } = usePerson(params.id as string);
  const { data: aboutData } = usePersonAbout(params.id as string);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className='flex h-[calc(100svh-theme(spacing.16))] flex-col'>
      {/* Fixed Header Section */}
      <div className='border-b bg-background'>
        <div className='mx-auto max-w-6xl px-5 py-3'>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href='/app/people' className='flex items-center gap-2 text-muted-foreground'>
                    <Users className='h-4 w-4' />
                    <span>People</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {person?.first_name} {person?.last_name}
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className='grid h-full grid-cols-3 overflow-hidden'>
        {/* Main Content Area */}
        <div className='col-span-2 h-full overflow-hidden'>
          <PersonHeader person={person} contactMethods={aboutData?.contactMethods} segment={segment} />
          <ScrollArea className='col-span-2 h-[calc(100svh-theme(spacing.52))] px-5'>
            <div className='py-3'>{children}</div>
            {/* Scrollable Content Area */}
            {/* <div className='flex h-full flex-1 overflow-hidden px-5'>
            <div className='flex-1 overflow-y-auto py-4'>{children}</div>
          </div> */}
          </ScrollArea>
        </div>

        {/* Sidebar - Independent Scroll */}
        <div className='flex h-full flex-col overflow-hidden border-l bg-stone-50'>
          <div className='no-scrollbar flex-1 overflow-y-auto px-4 py-4'>
            <PersonBioSidebar data={aboutData} />
          </div>
        </div>
      </div>
    </div>
  );
}
