'use client';

import { useParams, useRouter } from 'next/navigation';

import { PeopleTableSkeleton } from '@/components/tables/people-table-skeleton';
import { PeopleTableV2 } from '@/components/tables/people-table-v2';
import { useGroupMembers } from '@/hooks/use-group-members';
import { routes } from '@/lib/routes';

export default function GroupPage() {
  const router = useRouter();
  const params = useParams();
  const { data: people = [], isLoading, error } = useGroupMembers(params.id as string);

  const handleRowClick = (personId: string) => {
    router.push(routes.person.byId({ id: personId }));
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading group members</div>;

  return (
    <div className='absolute inset-0 top-[48px] mt-[1px]'>
      {isLoading ? (
        <PeopleTableSkeleton />
      ) : (
        <PeopleTableV2 people={people} onRowClick={handleRowClick} />
      )}
    </div>
  );
}
