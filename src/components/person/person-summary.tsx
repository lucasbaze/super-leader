'use client';

import { SinglePersonSummary } from '@/services/summary/generate-summary-content';

import { ProfileCompleteness } from './profile-completeness';
import { SectionGroup } from './section-group';
import { Suggestion } from './suggestion';

type PersonSummaryProps = {
  data: SinglePersonSummary;
};

export function PersonSummary({ data }: PersonSummaryProps) {
  return (
    <div className='flex flex-col space-y-8 p-0 pb-8'>
      <div className='flex flex-col space-y-4'>
        <ProfileCompleteness value={data.completeness} questions={data.followUpQuestions} />
      </div>

      <div className='space-y-3 px-6'>
        <h3 className='-mb-2 font-semibold'>Insights</h3>
        <p className='mb-4 text-gray-700'>Generated insights from the summary.</p>

        <div className='relative -mt-2'>
          <Suggestion suggestions={data.insightRecommendations} />
        </div>
      </div>

      <div className='space-y-3 px-6'>
        <h3 className='-mb-2 font-semibold'>Summary</h3>
        <p className='mb-4 text-gray-700'>
          A summary from all your notes, intereactions, and activity.
        </p>

        {data.groupedSections.map((group, index) => (
          <div key={index} className='flex flex-col'>
            <SectionGroup sections={group.sections} />
          </div>
        ))}
      </div>
    </div>
  );
}
