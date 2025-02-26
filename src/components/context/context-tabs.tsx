'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { ContextSummary as ContextSummarySchema } from '@/services/context/schemas';

import { ContextSummary } from './context-summary';

type ContextTabsProps = {
  contextSummary: ContextSummarySchema | null;
};

export function ContextTabs({ contextSummary }: ContextTabsProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'plan'>('about');

  return (
    <div className='flex h-full flex-col'>
      <div className='border-b bg-background'>
        <div className='flex items-center px-3 py-2'>
          <button
            onClick={() => setActiveTab('about')}
            className={cn(
              'rounded-md px-2 py-1 text-sm font-medium',
              activeTab === 'about'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}>
            You
          </button>
          <div className='mx-2 h-4 w-px bg-border'></div>
          <button
            onClick={() => setActiveTab('plan')}
            className={cn(
              'rounded-md px-2 py-1 text-sm font-medium',
              activeTab === 'plan'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted'
            )}>
            Plan
          </button>
        </div>
      </div>

      <div className='flex-1 overflow-hidden'>
        {activeTab === 'about' && (
          <>
            {contextSummary ? (
              <ContextSummary data={contextSummary} />
            ) : (
              <div className='flex h-full items-center justify-center'>
                <div className='p-6 text-center'>
                  <h3 className='mb-2 text-xl font-medium'>No context summary available</h3>
                  <p className='text-muted-foreground'>
                    This context summary is generated from your activity within the platform, and
                    helps build your pland and personalize suggestions, tasks, and more within the
                    application
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'plan' && (
          <div className='flex h-full items-center justify-center'>
            <div className='p-6 text-center'>
              <h3 className='mb-2 text-xl font-medium'>No plan available yet</h3>
              <p className='text-muted-foreground'>
                Plans help you organize your goals and track your progress.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
