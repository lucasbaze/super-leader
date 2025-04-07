'use client';

import { useState } from 'react';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

import { ChevronDown, ChevronUp } from '@/components/icons';
import { cn } from '@/lib/utils';

interface MarkdownMessageProps {
  content: string;
  isUserMessage?: boolean;
}

export function MarkdownMessage({ content, isUserMessage }: MarkdownMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const messageLines = content.split('\n').length;
  const shouldCollapse = isUserMessage && messageLines > 10;

  return (
    <div className='relative'>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          shouldCollapse && 'mb-4',
          shouldCollapse && !isExpanded && 'max-h-[260px]'
        )}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
            code: ({ node, className, children, ...props }) => {
              const match = /language-(\w+)/.exec(className || '');

              return match ? (
                <SyntaxHighlighter
                  // @ts-ignore
                  style={dark}
                  language={match[1]}
                  PreTag='div'
                  className='rounded-md'
                  {...props}>
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code
                  className={cn(
                    'bg-muted-foreground/20 rounded px-1.5 py-0.5 font-mono text-sm',
                    className
                  )}
                  {...props}>
                  {children}
                </code>
              );
            },
            ul: ({ children }) => <ul className='mb-2 list-disc pl-4 last:mb-0'>{children}</ul>,
            ol: ({ children }) => <ol className='mb-2 list-decimal pl-4 last:mb-0'>{children}</ol>,
            li: ({ children }) => <li className='mb-1 last:mb-0'>{children}</li>,
            h3: ({ children }) => (
              <h3 className='mb-2 text-base font-medium last:mb-0'>{children}</h3>
            ),
            h4: ({ children }) => <h4 className='mb-2 text-sm font-medium last:mb-0'>{children}</h4>
          }}>
          {content}
        </ReactMarkdown>
      </div>

      {shouldCollapse && (
        <button onClick={() => setIsExpanded(!isExpanded)} className='absolute -bottom-4 -right-1'>
          {isExpanded ? (
            <ChevronUp className='size-5 text-white' />
          ) : (
            <ChevronDown className='size-5 text-white' />
          )}
        </button>
      )}
    </div>
  );
}
