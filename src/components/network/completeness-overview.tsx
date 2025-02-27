'use client';

import { useEffect, useRef, useState } from 'react';

import { CompletionCard } from './completeness-card';

type CompletionData = {
  inner5: number;
  central50: number;
  strategic100: number;
  everyone: number;
};

type CompletionOverviewProps = {
  data: CompletionData;
  className?: string;
};

export function CompletenessOverview({ data, className }: CompletionOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<'full' | 'medium' | 'small'>('full');

  // Function to determine layout based on container width
  const updateLayout = () => {
    if (!containerRef.current) return;

    const width = containerRef.current.offsetWidth;

    if (width < 550) {
      setLayout('small');
    } else if (width < 800) {
      setLayout('medium');
    } else {
      setLayout('full');
    }
  };

  // Set up resize observer to watch container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    updateLayout();

    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={className} ref={containerRef}>
      <h1 className='text-lg font-semibold'>Completeness Overview</h1>
      <p className='mb-4 text-sm text-muted-foreground'>
        This measures how much information you have collected about your network within Superleader.
        Generally, the more diverse information you have, the more you're able to connect and add
        value with people.
      </p>

      {layout === 'full' && (
        <div className='grid grid-cols-4 gap-3'>
          <CompletionCard
            title='Inner 5'
            subtitle='Your Closest family'
            percentage={data.inner5}
            icon='5'
          />
          <CompletionCard
            title='Central 50'
            subtitle='Your strongest allies'
            percentage={data.central50}
            icon='50'
          />
          <CompletionCard
            title='Strategic 100'
            subtitle='Your long term partnerships'
            percentage={data.strategic100}
            icon='100'
          />
          <CompletionCard
            title='Everyone Else'
            subtitle='Your extended network'
            percentage={data.everyone}
            icon=''
            className='w-full'
          />
        </div>
      )}

      {layout === 'medium' && (
        <div className='space-y-3'>
          <div className='grid grid-cols-3 gap-3'>
            <CompletionCard
              title='Inner 5'
              subtitle='Your Closest family'
              percentage={data.inner5}
              icon='5'
            />
            <CompletionCard
              title='Central 50'
              subtitle='Your strongest allies'
              percentage={data.central50}
              icon='50'
            />
            <CompletionCard
              title='Strategic 100'
              subtitle='Your long term partnerships'
              percentage={data.strategic100}
              icon='100'
            />
          </div>
          <CompletionCard
            title='Everyone Else'
            subtitle='Your extended network'
            percentage={data.everyone}
            icon=''
            variant='horizontal'
            className='w-full'
          />
        </div>
      )}

      {layout === 'small' && (
        <div className='flex flex-col gap-3'>
          <CompletionCard
            title='Inner 5'
            subtitle='Your Closest family'
            percentage={data.inner5}
            icon='5'
            variant='horizontal'
          />
          <CompletionCard
            title='Central 50'
            subtitle='Your strongest allies'
            percentage={data.central50}
            icon='50'
            variant='horizontal'
          />
          <CompletionCard
            title='Strategic 100'
            subtitle='Your long term partnerships'
            percentage={data.strategic100}
            icon='100'
            variant='horizontal'
          />
          <CompletionCard
            title='Everyone Else'
            subtitle='Your extended network'
            percentage={data.everyone}
            icon=''
            variant='horizontal'
          />
        </div>
      )}
    </div>
  );
}
