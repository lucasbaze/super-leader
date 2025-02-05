'use client';

import { useRouter } from 'next/navigation';
import { use } from 'react';

import { PeopleTable } from '@/components/tables/people-table';
import { useGroupMembers } from '@/hooks/use-group-members';
import { useGroups } from '@/hooks/use-groups';

interface GroupPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function GroupPage({ params }: GroupPageProps) {
  const router = useRouter();
  const { slug } = use(params);
  const { data: groups = [] } = useGroups();
  const { data: people = [], isLoading, error } = useGroupMembers(slug);

  const group = groups.find((g) => g.slug === slug);

  const handleRowClick = (personId: string) => {
    router.push(`/app/person/${personId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading group members</div>;
  if (!group) return <div>Group not found</div>;

  return (
    <div className='absolute inset-0'>
      <div className='border-b'>
        <div className='flex h-12 items-center justify-between px-4'>
          <h1 className='text-lg font-semibold'>{group.name}</h1>
        </div>
      </div>
      <div className='absolute inset-0 top-[48px]'>
        <PeopleTable
          people={people}
          onRowClick={handleRowClick}
          emptyMessage={`No members found in ${group.name}`}
        />
      </div>
    </div>
  );
}
