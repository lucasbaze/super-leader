'use client';

import { useRouter } from 'next/navigation';

import { PeopleTable } from '@/components/tables/people-table';
import { PeopleTableV2 } from '@/components/tables/people-table-v2';
import { usePeople } from '@/hooks/use-people';

export default function PeoplePage() {
  const router = useRouter();
  const { data: people = [], isLoading, error } = usePeople();

  const handleRowClick = (personId: string) => {
    router.push(`/app/person/${personId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading people</div>;

  return (
    <div className='absolute inset-0'>
      <div className='border-b'>
        <div className='flex h-12 items-center justify-between px-4'>
          <i>People filtering and viewing actions will go here</i>
        </div>
      </div>
      <div className='absolute inset-0 top-[48px]'>
        <PeopleTableV2 people={people} onRowClick={handleRowClick} />
      </div>
    </div>
  );
}
