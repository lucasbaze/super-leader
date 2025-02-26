'use client';

import { useRouter } from 'next/navigation';

import { PeopleHeader } from '@/components/people/people-header';
import { PeopleTableSkeleton } from '@/components/tables/people-table-skeleton';
import { PeopleTableV2 } from '@/components/tables/people-table-v2';
import { usePeople } from '@/hooks/use-people';
import { routes } from '@/lib/routes';

export default function PeoplePage() {
  const router = useRouter();
  const { data: people = [], isLoading, error } = usePeople();

  const handleRowClick = (personId: string) => {
    router.push(routes.person.byId({ id: personId }));
  };

  if (error) return <div>Error loading people</div>;

  return (
    <div className='absolute inset-0'>
      <PeopleHeader peopleCount={isLoading ? 0 : people.length} />
      <div className='absolute inset-0 top-[48px] mt-[1px]'>
        {isLoading ? (
          <PeopleTableSkeleton />
        ) : (
          <PeopleTableV2 people={people} onRowClick={handleRowClick} />
        )}
      </div>
    </div>
  );
}
