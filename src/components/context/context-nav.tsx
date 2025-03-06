'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import { GroupedSection } from '@/services/context/schemas';

type ContextNavProps = {
  sections: GroupedSection[];
  activeSection: number;
  onSectionChange: (index: number) => void;
};

export function ContextNav({ sections, activeSection, onSectionChange }: ContextNavProps) {
  return (
    <div className='h-full w-56 overflow-y-auto border-r'>
      <nav className='flex h-full flex-col py-2'>
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => onSectionChange(index)}
            className={cn(
              'px-4 py-2 text-left text-sm transition-colors',
              'flex items-center hover:bg-muted',
              activeSection === index
                ? 'bg-muted/50 font-medium text-foreground'
                : 'text-muted-foreground'
            )}>
            <span>{section.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
