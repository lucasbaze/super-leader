'use client';

import { Completeness } from './completeness';
import { Highlights } from './highlights';
import { SectionGroup } from './section-group';
import { Suggestion } from './suggestion';

type TPersonSummary = {
  completeness: number;
  highlights: string;
  groupedSections: Array<{
    sections: Array<{
      title: string;
      icon: string;
      content: string;
      forYou: string;
    }>;
    suggestion: {
      content: string;
      reason: string;
    };
  }>;
};

export function PersonSummary({ data }: { data: TPersonSummary }) {
  return (
    <div className='flex flex-col space-y-6 p-4'>
      <div className='flex flex-col space-y-4'>
        <Completeness value={data.completeness} />
        <Highlights text={data.highlights} />
      </div>

      {data.groupedSections.map((group, index) => (
        <div key={index} className='flex flex-col space-y-4'>
          <SectionGroup sections={group.sections} />
          <Suggestion {...group.suggestion} />
        </div>
      ))}
    </div>
  );
}
