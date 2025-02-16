'use client';

import { useRouter } from 'next/navigation';

import { PeopleHeader } from '@/components/people/people-header';
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
      <div className='mb-4 flex flex-col rounded-t-md border-b bg-background'>
        <PeopleHeader peopleCount={people.length} />
      </div>
      <div className='absolute inset-0 top-[48px] mt-[1px]'>
        <PeopleTableV2 people={people} onRowClick={handleRowClick} />
      </div>
    </div>
  );
}
