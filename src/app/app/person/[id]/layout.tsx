'use client';

import { useParams, useRouter, useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

import { ChevronLeft, Loader, Sparkles } from '@/components/icons';
import { FollowUpIndicator } from '@/components/indicators/follow-up-indicator';
import { PersonBioSidebar } from '@/components/person/bio-sidebar';
import { PersonHeader } from '@/components/person/person-header';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePerson } from '@/hooks/use-person';
import { useUpdateAISummary } from '@/hooks/use-update-ai-summary';
import { useRecentlyViewedStore } from '@/stores/use-recently-viewed-store';

export default function PersonLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const segment = useSelectedLayoutSegment() || 'activity';
  const addRecentlyViewed = useRecentlyViewedStore((state) => state.addPerson);
  const { data, isLoading } = usePerson(params.id as string, {
    withContactMethods: true,
    withAddresses: true,
    withWebsites: true,
    withGroups: true
  });
  const updateAISummary = useUpdateAISummary();

  // Add to recently viewed when data loads
  React.useEffect(() => {
    if (data?.person) {
      addRecentlyViewed({
        id: data.person.id,
        first_name: data.person.first_name,
        last_name: data.person.last_name ?? ''
      });
    }
  }, [data?.person, addRecentlyViewed]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <div className='flex h-[calc(100svh-theme(spacing.16))] flex-col'>
        {/* Fixed Header Section */}
        <div className='flex items-center border-b bg-background md:rounded-t-md'>
          <div className='flex items-center p-1'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.back()}
              className='mr-2 text-muted-foreground'>
              <ChevronLeft className='size-4' />
            </Button>
            <div className='mr-2 text-sm text-muted-foreground'>
              {data?.person.first_name} {data?.person?.last_name}
            </div>
          </div>
          <div className='flex items-center gap-2 pr-4'>
            <FollowUpIndicator
              value={data?.person.follow_up_score ?? 0}
              personId={data?.person.id}
              size='sm'
              editable
            />
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                if (data?.person?.id) {
                  updateAISummary.mutate({ personId: data.person.id });
                }
              }}
              disabled={updateAISummary.isPending}>
              {updateAISummary.isPending ? (
                <>
                  <Loader className='mr-2 size-4 animate-spin' />
                  Updating...
                </>
              ) : (
                <>
                  <Sparkles className='mr-2 size-4' />
                  Update Summary
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className='grid h-full grid-cols-4 overflow-hidden'>
          {/* Main Content Area */}
          <div className='col-span-3 h-full overflow-hidden'>
            <PersonHeader person={data?.person} groups={data?.groups} segment={segment} />
            <ScrollArea className='col-span-2 h-[calc(100svh-theme(spacing.52))] px-5'>
              <div className='pb-24 pt-2'>{children}</div>
            </ScrollArea>
          </div>

          {/* Sidebar - Independent Scroll */}
          <div className='flex h-full flex-col overflow-hidden border-l bg-gray-100'>
            <div className='no-scrollbar flex-1 overflow-y-auto px-4 pb-4'>
              <PersonBioSidebar data={data} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
