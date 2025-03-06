'use client';

import { SinglePersonSummary } from '@/services/summary/generate-summary-content';

import { Completeness } from './completeness';
import { Highlights } from './highlights';
import { SectionGroup } from './section-group';
import { Suggestion } from './suggestion';

type TPersonSummaryProps = {
  data: SinglePersonSummary;
};

export function PersonSummary({ data }: TPersonSummaryProps) {
  return (
    <div className='flex flex-col space-y-8 p-0'>
      <div className='flex flex-col space-y-4'>
        {/* <Completeness value={data.completeness} /> */}
        <Highlights text={data.highlights} />
      </div>

      {data.groupedSections.map((group, index) => (
        <div key={index} className='flex flex-col'>
          <SectionGroup sections={group.sections} />
          <Suggestion {...group.suggestion} />
        </div>
      ))}
    </div>
  );
}
