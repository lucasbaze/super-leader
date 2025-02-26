'use client';

import { useRouter } from 'next/navigation';

import { GroupBadge } from '@/components/groups/group-badge';
import { FollowUpIndicator } from '@/components/indicators/follow-up-indicator';
import { UpdateFollowUpScoreButton } from '@/components/person/update-follow-up-score-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { routes } from '@/lib/routes';
import type { TPersonGroup } from '@/types/custom';
import type { Person } from '@/types/database';

import { CircleProgress } from '../ui/circle-progress';

interface PersonHeaderProps {
  person: Person | undefined;
  groups?: TPersonGroup[];
  segment: string | null;
}

// TODO: Do something with thhe "contact Methods"
export function PersonHeader({ person, groups = [], segment }: PersonHeaderProps) {
  const router = useRouter();
  const initials = `${person?.first_name[0]}${person?.last_name?.[0] || ''}`;

  return (
    <div className='px-5'>
      <div className='mt-4 flex flex-col gap-4'>
        <div className='flex items-center gap-3'>
          <Avatar className='size-8'>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <h1 className='text-lg font-medium'>
            {person?.first_name} {person?.last_name}
          </h1>
          {groups.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {groups.map((group) => (
                <GroupBadge key={group.id} group={group} asLink />
              ))}
            </div>
          )}
        </div>
        {/* <UpdateFollowUpScoreButton personId={person?.id || ''} /> */}
      </div>

      <div className='-mx-5'>
        <Tabs value={segment || 'activity'} className='mt-6'>
          <TabsList variant='underline' className='w-full justify-start gap-2 px-5'>
            <TabsTrigger
              value='activity'
              variant='underline'
              onClick={() => router.push(routes.person.byId({ id: person?.id || '' }))}>
              <span className='mr-2'>Activity</span>
              <FollowUpIndicator
                value={person?.follow_up_score ?? 0}
                personId={person?.id}
                size='sm'
                editable
              />
            </TabsTrigger>
            <TabsTrigger
              value='summary'
              variant='underline'
              onClick={() => router.push(routes.person.summary({ id: person?.id || '' }))}>
              <span className='mr-2'>Summary</span>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <div className='hover:cursor-pointer'>
                      <CircleProgress value={person?.completeness_score ?? 0} size={16} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Profile Completeness: {person?.completeness_score ?? 0}%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TabsTrigger>
            {/* <TabsTrigger
              value='discovered'
              variant='underline'
              onClick={() => {
                toast.info('Coming soon');
              }}>
              Discovered
            </TabsTrigger> */}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
