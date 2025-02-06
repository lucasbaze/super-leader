'use client';

import { useParams, useRouter } from 'next/navigation';

import { PeopleTable } from '@/components/tables/people-table';
import { useGroupMembers } from '@/hooks/use-group-members';

export default function GroupPage() {
  const router = useRouter();
  const params = useParams();
  const { data: people = [], isLoading, error } = useGroupMembers(params.slug as string);

  const handleRowClick = (personId: string) => {
    router.push(`/app/person/${personId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading group members</div>;

  return (
    <div className='relative h-full'>
      <PeopleTable
        people={people}
        onRowClick={handleRowClick}
        emptyMessage='No members found in this group'
      />
    </div>
  );
}
