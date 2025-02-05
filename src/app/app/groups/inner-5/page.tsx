'use client';

import { useRouter } from 'next/navigation';

import { PeopleTable } from '@/components/tables/people-table';
import { useGroupMembers } from '@/hooks/use-group-members';
import { RESERVED_GROUP_SLUGS } from '@/lib/groups/constants';

export default function InnerFivePage() {
  const router = useRouter();
  const { data: people = [], isLoading, error } = useGroupMembers(RESERVED_GROUP_SLUGS.INNER_5);

  const handleRowClick = (personId: string) => {
    router.push(`/app/person/${personId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading Inner 5 members</div>;

  return (
    <div className='absolute inset-0'>
      <div className='border-b'>
        <div className='flex h-12 items-center justify-between px-4'>
          <h1 className='text-lg font-semibold'>Inner 5</h1>
        </div>
      </div>
      <div className='absolute inset-0 top-[48px]'>
        <PeopleTable
          people={people}
          onRowClick={handleRowClick}
          emptyMessage='No members found in Inner 5'
        />
      </div>
    </div>
  );
}
