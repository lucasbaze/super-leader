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
import { usePerson } from '@/hooks/use-people';
import { usePersonAbout } from '@/hooks/use-person-about';

export default function PersonLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const segment = useSelectedLayoutSegment() || 'summary';
  const { data: person, isLoading } = usePerson(params.id as string);
  const { data: aboutData } = usePersonAbout(params.id as string);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className='flex flex-col'>
      {/* Header */}
      <div className='border-b'>
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
      <div className='mx-auto w-full max-w-6xl'>
        <div className='grid grid-cols-3 gap-8'>
          <div className='col-span-2'>
            <PersonHeader person={person} contactMethods={aboutData?.contactMethods} segment={segment} />

            <div className='py-4'>{children}</div>
          </div>

          {/* Sidebar Column */}
          <div className='border-l bg-stone-50 px-4 pt-4'>
            <PersonBioSidebar data={aboutData} />
          </div>
        </div>
      </div>
    </div>
  );
}
