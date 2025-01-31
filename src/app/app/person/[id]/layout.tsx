'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useParams, useRouter, useSelectedLayoutSegment } from 'next/navigation';

import { Edit, Users } from '@/components/icons';
import { PersonBioSidebar } from '@/components/person/bio-sidebar';
import { BioSidebarEdit } from '@/components/person/bio-sidebar-edit';
import { PersonHeader } from '@/components/person/person-header';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePerson } from '@/hooks/use-people';
import { usePersonAbout } from '@/hooks/use-person-about';
import { PersonEditFormData } from '@/lib/schemas/person-edit';
import { useQueryClient } from '@tanstack/react-query';

export default function PersonLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const segment = useSelectedLayoutSegment() || 'summary';
  const { data: person, isLoading } = usePerson(params.id as string);
  const { data: aboutData } = usePersonAbout(params.id as string);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  if (isLoading || !aboutData) return <div>Loading...</div>;

  const handleEditSubmit = async (data: PersonEditFormData) => {
    console.log('Layout handleEditSubmit called with:', data);
    try {
      const response = await fetch(`/api/person/${params.id}/details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update');
      }

      setIsEditing(false);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['person', params.id]
        }),
        queryClient.invalidateQueries({
          queryKey: ['person', params.id, 'about']
        })
      ]);
    } catch (error) {
      console.error('Failed to update person details:', error);
    }
  };

  return (
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
        <Button
          variant='ghost'
          size='sm'
          className='ml-auto'
          onClick={() => setIsEditing(!isEditing)}>
          <Edit className='mr-2 h-4 w-4' />
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      {/* Main Content with Sidebar */}
      <div className='grid h-full grid-cols-3 overflow-hidden'>
        {/* Main Content Area */}
        <div className='col-span-2 h-full overflow-hidden'>
          <PersonHeader
            person={person}
            contactMethods={aboutData?.contactMethods}
            segment={segment}
          />
          <ScrollArea className='col-span-2 h-[calc(100svh-theme(spacing.52))] px-5'>
            <div className='py-3'>{children}</div>
            {/* Scrollable Content Area */}
            {/* <div className='flex h-full flex-1 overflow-hidden px-5'>
            <div className='flex-1 overflow-y-auto py-4'>{children}</div>
          </div> */}
          </ScrollArea>
        </div>

        {/* Sidebar - Independent Scroll */}
        <div className='flex h-full flex-col overflow-hidden border-l'>
          <div className='no-scrollbar flex-1 overflow-y-auto px-4 py-4'>
            {isEditing ? (
              <BioSidebarEdit data={aboutData} onSubmit={handleEditSubmit} />
            ) : (
              <PersonBioSidebar data={aboutData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
