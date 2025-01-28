import { cn } from '@/lib/utils';

import { Message } from 'ai';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className='absolute inset-0 overflow-y-auto p-4'>
      <div className='flex flex-col gap-4'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex flex-col gap-2 rounded-lg px-3 py-2 text-sm',
              'max-w-[90%] break-words',
              message.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-muted'
            )}>
            <ReactMarkdown
              components={{
                // Style different markdown elements
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
                      className={cn('rounded bg-muted-foreground/20 px-1.5 py-0.5 font-mono text-sm', className)}
                      {...props}>
                      {children}
                    </code>
                  );
                },
                ul: ({ children }) => <ul className='mb-2 list-disc pl-4 last:mb-0'>{children}</ul>,
                ol: ({ children }) => <ol className='mb-2 list-decimal pl-4 last:mb-0'>{children}</ol>,
                li: ({ children }) => <li className='mb-1 last:mb-0'>{children}</li>,
                h3: ({ children }) => <h3 className='mb-2 text-base font-medium last:mb-0'>{children}</h3>,
                h4: ({ children }) => <h4 className='mb-2 text-sm font-medium last:mb-0'>{children}</h4>
              }}>
              {message.content}
            </ReactMarkdown>
          </div>
        ))}
        {isLoading && (
          <div className='flex max-w-[90%] flex-col gap-2 rounded-lg bg-muted px-3 py-2 text-sm'>Thinking...</div>
        )}
      </div>
    </div>
  );
}
