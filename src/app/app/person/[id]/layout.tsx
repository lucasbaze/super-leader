'use client';

import Link from 'next/link';
import { useParams, useSelectedLayoutSegment } from 'next/navigation';

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
import { usePerson } from '@/hooks/use-person';

export default function PersonLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const segment = useSelectedLayoutSegment() || 'summary';
  const { data, isLoading } = usePerson(params.id as string);

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className='flex h-[calc(100svh-theme(spacing.16))] flex-col'>
        {/* Fixed Header Section */}
        <div className='flex items-center border-b bg-background'>
          <div className='px-5 py-3'>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href='/app/people'
                      className='flex items-center gap-2 text-muted-foreground'>
                      <Users className='size-4' />
                      <span>People</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {data?.person.first_name} {data?.person?.last_name}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className='grid h-full grid-cols-3 overflow-hidden'>
          {/* Main Content Area */}
          <div className='col-span-2 h-full overflow-hidden'>
            <PersonHeader
              person={data?.person}
              contactMethods={data?.contactMethods}
              segment={segment}
            />
            <ScrollArea className='col-span-2 h-[calc(100svh-theme(spacing.52))] px-5'>
              <div className='py-3'>{children}</div>
            </ScrollArea>
          </div>

          {/* Sidebar - Independent Scroll */}
          <div className='flex h-full flex-col overflow-hidden border-l'>
            <div className='no-scrollbar flex-1 overflow-y-auto px-4 pb-4'>
              <PersonBioSidebar data={data} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
