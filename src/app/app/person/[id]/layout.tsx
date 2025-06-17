'use client';

import { useParams, useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { useEffect } from 'react';

import { BaseHeader } from '@/components/headers/base-header';
import { ChevronLeft, Loader, Sparkles } from '@/components/icons';
import { FollowUpIndicator } from '@/components/indicators/follow-up-indicator';
import { PersonBioSidebar } from '@/components/person/bio-sidebar';
import { DeletePersonModal } from '@/components/person/delete-person-modal';
import { PersonHeader } from '@/components/person/person-header';
import { PersonLayoutSkeleton } from '@/components/skeletons/person-layout-skeleton';
import { Button } from '@/components/ui/button';
import { usePerson } from '@/hooks/use-person';
import { useTasks } from '@/hooks/use-tasks';
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
    withGroups: true,
    withOrganizations: true,
    withPersonPersonRelations: true
  });

  const { data: tasks } = useTasks(params.id as string);
  const updateAISummary = useUpdateAISummary();

  // Add to recently viewed when data loads
  useEffect(() => {
    if (data?.person) {
      addRecentlyViewed({
        id: data.person.id,
        first_name: data.person.first_name,
        last_name: data.person.last_name ?? ''
      });
    }
  }, [data?.person, addRecentlyViewed]);

  if (isLoading) return <PersonLayoutSkeleton />;

  return (
    <div className='absolute inset-0'>
      {/* Fixed Header Section */}
      <BaseHeader className='flex flex-1 items-center justify-between'>
        <div className='flex items-center gap-2 pr-2 text-sm font-semibold text-muted-foreground'>
          <span className='pr-2'>
            {data?.person.first_name} {data?.person?.last_name}
          </span>
          {/* <FollowUpIndicator
            value={data?.person.follow_up_score ?? 0}
            personId={data?.person.id}
            size='sm'
            editable
          /> */}
        </div>
        <div className='flex items-center gap-2 pr-4'>
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
          {data?.person && <DeletePersonModal person={data.person} />}
        </div>
      </BaseHeader>

      {/* Main Content with Sidebar */}
      <div className='absolute inset-0 top-[48px]'>
        <div className='grid h-full grid-cols-3 overflow-hidden'>
          {/* Main Content Area */}
          <div className='col-span-2 h-full overflow-hidden'>
            <PersonHeader
              person={data?.person}
              groups={data?.groups}
              segment={segment}
              taskCount={tasks?.length ?? 0}
            />
            <div className='flex h-full flex-col overflow-hidden'>
              <div className='no-scrollbar flex-1 overflow-y-auto pb-4'>
                <div className='pb-24 pt-2'>{children}</div>
              </div>
            </div>
          </div>

          {/* Sidebar - Independent Scroll */}
          <div className='flex h-full flex-col overflow-hidden border-l bg-gray-100'>
            <div className='no-scrollbar flex-1 overflow-y-auto px-4 pb-4'>
              <PersonBioSidebar
                person={data?.person}
                contactMethods={data?.contactMethods}
                addresses={data?.addresses}
                websites={data?.websites}
                groups={data?.groups}
                organizations={data?.organizations}
                associatedPeople={data?.personPersonRelations}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
