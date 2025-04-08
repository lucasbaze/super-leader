'use client';

import { useParams } from 'next/navigation';

import { ActivityTimeline } from '@/components/timeline/activity-timeline';
import { usePersonActivity } from '@/hooks/use-person-activity';

export default function PersonActivityPage() {
  const params = useParams();
  const { data: interactions, isLoading, error } = usePersonActivity(params.id as string);

  if (isLoading) {
    return <div className='p-4 text-sm text-muted-foreground'>Loading activity...</div>;
  }

  if (error) {
    return <div className='text-destructive'>Failed to load activity</div>;
  }

  if (!interactions || interactions.length === 0) {
    return (
      <div className='p-4 text-sm text-muted-foreground'>
        No activity recorded yet. Add some notes, interactions, or activity to get started.
      </div>
    );
  }

  return (
    <div className='space-y-4 px-6'>
      <h2 className='text-xl font-semibold'>Recent Activity</h2>
      <ActivityTimeline interactions={interactions || []} />
    </div>
  );
}
