'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import { GroupedSection } from '@/services/context/schemas';

type ContextNavProps = {
  sections: GroupedSection[];
  activeSection: number;
  onSectionClick: (index: number) => void;
};

export function ContextNav({ sections, activeSection, onSectionClick }: ContextNavProps) {
  const handleClick = (index: number) => {
    // Scroll to the section
    const element = document.getElementById(`section-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    onSectionClick(index);
  };

  return (
    <div className='h-full min-w-48 border-r bg-background'>
      <nav className='flex flex-col py-2'>
        {sections.map((section, index) => (
          <button
            key={index}
            onClick={() => handleClick(index)}
            className={cn(
              'px-4 py-2 text-left text-sm transition-colors',
              'flex items-center hover:bg-muted',
              activeSection === index ? 'bg-muted/50 font-medium text-foreground' : 'text-muted-foreground'
            )}>
            <span>{section.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
