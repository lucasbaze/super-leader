'use client';

import { useParams } from 'next/navigation';

import { usePerson } from '@/hooks/use-person';

export default function PersonActivityPage() {
  const params = useParams();
  const { data: person } = usePerson(params.id as string);

  return (
    <div className='flex flex-col space-y-4 overflow-y-auto'>
      <h2 className='text-xl font-semibold'>Summary</h2>
      {/* Placeholder for activity feed */}
    </div>
  );
}
