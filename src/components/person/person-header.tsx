'use client';

import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

import { GroupBadge } from '@/components/groups/group-badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TPersonGroup } from '@/types/custom';
import type { ContactMethod, Person } from '@/types/database';

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
      </div>

      <div className='-mx-5'>
        <Tabs value={segment || 'summary'} className='mt-6'>
          <TabsList variant='underline' className='w-full justify-start gap-2 px-5'>
            <TabsTrigger
              value='summary'
              variant='underline'
              onClick={() => router.push(`/app/person/${person?.id}`)}>
              Summary
            </TabsTrigger>
            <TabsTrigger
              value='activity'
              variant='underline'
              onClick={() => router.push(`/app/person/${person?.id}/activity`)}>
              Activity
            </TabsTrigger>
            <TabsTrigger
              value='discovered'
              variant='underline'
              onClick={() => {
                toast.info('Coming soon');
              }}>
              Discovered
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
