'use client';

import { useParams } from 'next/navigation';

import { GroupHeader } from '@/components/groups/group-header';
import { useGroupMembers } from '@/hooks/use-group-members';
import { useGroups } from '@/hooks/use-groups';

export default function GroupLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const { data: groups = [] } = useGroups();
  const { data: people = [] } = useGroupMembers(params.id as string);
  const group = groups.find((g) => g.id === params.id);

  if (!group) {
    return <div>Group not found</div>;
  }

  return (
    <div className='flex h-[calc(100svh-theme(spacing.16))] flex-col'>
      {/* Fixed Header Section */}
      <div className='flex flex-col rounded-t-md border-b bg-background'>
        <GroupHeader group={group} groupMemberCount={people.length} />
      </div>

      {/* Main Content Area */}
      <div className='flex-1 overflow-hidden'>{children}</div>
    </div>
  );
}
