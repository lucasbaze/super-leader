'use client';

import { useRouter } from 'next/navigation';

import { GroupBadge } from '@/components/groups/group-badge';
import { FollowUpIndicator } from '@/components/indicators/follow-up-indicator';
import { UpdateFollowUpScoreButton } from '@/components/person/update-follow-up-score-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { routes } from '@/lib/routes';
import type { TPersonGroup } from '@/types/custom';
import type { Person } from '@/types/database';

import { ProfileCompleteness } from '../indicators/profile-completeness';
import { TaskCount } from '../indicators/task-count';

interface PersonHeaderProps {
  person: Person | undefined;
  groups?: TPersonGroup[];
  segment: string | null;
  taskCount: number;
}

// TODO: Do something with thhe "contact Methods"
export function PersonHeader({ person, groups = [], segment, taskCount }: PersonHeaderProps) {
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
              <ProfileCompleteness score={person?.completeness_score ?? 0} size={16} />
            </TabsTrigger>
            <TabsTrigger
              value='tasks'
              variant='underline'
              onClick={() => router.push(routes.person.tasks({ id: person?.id || '' }))}>
              <span className='mr-2'>Tasks</span>
              <TaskCount count={taskCount} />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
