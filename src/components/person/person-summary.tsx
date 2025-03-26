'use client';

import { SinglePersonSummary } from '@/services/summary/generate-summary-content';

import { Highlights } from './highlights';
import { ProfileCompleteness } from './profile-completeness';
import { SectionGroup } from './section-group';
import { Suggestion } from './suggestion';

type TPersonSummaryProps = {
  data: SinglePersonSummary;
};

export function PersonSummary({ data }: TPersonSummaryProps) {
  return (
    <div className='flex flex-col space-y-8 p-0'>
      <div className='flex flex-col space-y-4'>
        <ProfileCompleteness
          value={data.completeness}
          questions={[
            "What is Darian's current job or career focus?",
            'What specific skills or expertise does Darian have?',
            'Has Darian achieved any notable professional accomplishments?',
            "What are Darian's long-term goals or aspirations?"
          ]}
        />
        {/* <Highlights text={data.highlights} /> */}
      </div>

      <div className='px-6'>
        <h3 className='font-semibold'>Summary</h3>
        <p className='mb-4 text-gray-700'>
          A summary from all your notes, intereactions, and activity.
        </p>

        {data.groupedSections.map((group, index) => (
          <div key={index} className='flex flex-col'>
            <SectionGroup sections={group.sections} />
            <Suggestion {...group.suggestion} />
          </div>
        ))}
      </div>
    </div>
  );
}
