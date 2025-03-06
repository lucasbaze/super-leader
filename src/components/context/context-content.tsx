'use client';

import { GroupedSection } from '@/services/context/schemas';

import { ContextSection } from './context-section';

type ContextContentProps = {
  groupedSection: GroupedSection;
};

export function ContextContent({ groupedSection }: ContextContentProps) {
  return (
    <div className='h-full overflow-y-auto p-5'>
      <h2 className='mb-4 text-xl font-bold'>{groupedSection.title}</h2>
      {groupedSection.sections.map((section, index) => (
        <ContextSection key={index} section={section} />
      ))}
    </div>
  );
}
