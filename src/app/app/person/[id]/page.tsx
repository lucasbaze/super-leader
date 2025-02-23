'use client';

import { useParams } from 'next/navigation';

import { PersonSummary } from '@/components/person/person-summary';
import { usePerson } from '@/hooks/use-person';

export default function PersonSummaryPage() {
  const params = useParams();
  const { data } = usePerson(params.id as string);

  if (!data?.person?.ai_summary) {
    return (
      <div className='p-4 text-sm text-muted-foreground'>
        No summary available. Click &quot;Update Summary&quot; to generate one.
      </div>
    );
  }

  return (
    <div className='flex flex-col space-y-4 overflow-y-auto'>
      {/* @ts-ignore TODO: Fix this */}
      <PersonSummary data={data.person.ai_summary} />
    </div>
  );
}
