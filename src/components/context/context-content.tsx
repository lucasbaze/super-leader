'use client';

import { ComponentProps, ReactNode } from 'react';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { cn } from '@/lib/utils';
import { GroupedSection } from '@/services/context/schemas';

type ContextContentProps = {
  sections: GroupedSection[];
  onSectionInView?: (index: number) => void;
};

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: ReactNode;
}

interface MarkdownComponentProps {
  children?: ReactNode;
}

// Shared markdown components configuration
const markdownComponents: Partial<ComponentProps<typeof ReactMarkdown>['components']> = {
  p: ({ children }: MarkdownComponentProps) => <span className='text-gray-700'>{children}</span>,
  code: ({ inline, className, children }: CodeBlockProps) => {
    const match = /language-(\w+)/.exec(className || '');

    return !inline && match ? (
      <SyntaxHighlighter style={dark as any} language={match[1]} PreTag='div' className='rounded-md'>
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={cn('bg-muted-foreground/20 rounded px-1.5 py-0.5 font-mono text-sm', className)}>
        {children}
      </code>
    );
  },
  ul: ({ children }: MarkdownComponentProps) => <ul className='mb-2 list-disc pl-4 last:mb-0'>{children}</ul>,
  ol: ({ children }: MarkdownComponentProps) => <ol className='mb-2 list-decimal pl-4 last:mb-0'>{children}</ol>,
  li: ({ children }: MarkdownComponentProps) => <li className='mb-1 last:mb-0'>{children}</li>
};

export function ContextContent({ sections, onSectionInView }: ContextContentProps) {
  return (
    <div className='h-full overflow-y-auto px-8 py-6'>
      {sections.map((groupedSection, groupIndex) => (
        <div key={groupIndex} id={`section-${groupIndex}`} className='mb-12 scroll-mt-4 last:mb-4'>
          <h2 className='mb-6 text-2xl font-bold'>{groupedSection.title}</h2>
          <div className='flex flex-col'>
            {groupedSection.sections.map((section, index) => (
              <div
                key={index}
                className={`relative p-4 ${
                  index === 0
                    ? `rounded-t-lg border ${
                        index + 1 < groupedSection.sections.length ? 'border-b-0' : 'rounded-b-lg border-b'
                      }`
                    : index === groupedSection.sections.length - 1
                      ? 'rounded-b-lg border border-t-0 pb-8'
                      : 'border-x pb-4'
                }`}>
                <div className='mb-1 flex items-center space-x-2'>
                  <span className='text-sm'>{section.icon}</span>
                  <h3 className='text-xs uppercase tracking-wide text-gray-500'>{section.title}</h3>
                </div>
                <div className='pl-7'>
                  <ReactMarkdown components={markdownComponents}>{section.content}</ReactMarkdown>
                </div>
                {index !== groupedSection.sections.length - 1 && (
                  <div className='absolute bottom-0 left-1/2 h-px w-24 -translate-x-1/2 transform bg-gray-200' />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
