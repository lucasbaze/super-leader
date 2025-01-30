'use client';

import { useParams } from 'next/navigation';

import { usePerson } from '@/hooks/use-people';

export default function PersonActivityPage() {
  const params = useParams();
  const { data: person } = usePerson(params.id as string);

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-semibold'>Summary</h2>
      {/* Placeholder for activity feed */}
      <div className='text-muted-foreground'>A generated summary will appear here</div>
    </div>
  );
}
