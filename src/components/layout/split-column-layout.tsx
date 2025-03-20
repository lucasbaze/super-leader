'use client';

import { ReactNode } from 'react';

interface SplitLayoutProps {
  leftContent: ReactNode;
  children: ReactNode;
}

export function SplitLayout({ leftContent, children }: SplitLayoutProps) {
  return (
    <div className='flex min-h-screen'>
      {/* Left column - Fixed */}
      <div className='reltaive bg-primary-900 fixed inset-y-0 left-0 flex w-1/4 flex-col'>
        {leftContent}
      </div>

      {/* Right column - Scrollable */}
      <div className='bg-primary-900 relative ml-[25%] min-h-screen w-3/4 overflow-y-auto p-3'>
        {children}
      </div>
    </div>
  );
}
