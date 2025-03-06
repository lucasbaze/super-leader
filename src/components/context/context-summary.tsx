'use client';

import { useState } from 'react';

import { ContextSummary as ContextSummarySchema } from '@/services/context/schemas';

import { ContextContent } from './context-content';
import { ContextNav } from './context-nav';

type ContextSummaryProps = {
  data: ContextSummarySchema;
};

export function ContextSummary({ data }: ContextSummaryProps) {
  const [activeSection, setActiveSection] = useState(0);

  if (!data.groupedSections.length) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='p-6 text-center'>
          <h3 className='mb-2 text-xl font-medium'>No context summary available</h3>
          <p className='text-muted-foreground'>
            Context summaries help you understand your relationships and goals better.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-full overflow-hidden'>
      <ContextNav
        sections={data.groupedSections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className='flex-1 overflow-hidden'>
        <ContextContent groupedSection={data.groupedSections[activeSection]} />
      </div>
    </div>
  );
}
