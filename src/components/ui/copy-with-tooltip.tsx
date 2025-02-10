import { ReactNode, useState } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CopyWithTooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
}

export function CopyWithTooltip({ content, children, className }: CopyWithTooltipProps) {
  const [tooltipContent, setTooltipContent] = useState('Click to copy');
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setTooltipContent('Copied!');
      // Keep the tooltip open for the duration of the "Copied!" message
      setIsOpen(true);
      setTimeout(() => {
        setTooltipContent('Click to copy');
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <div onClick={handleCopy} className={`cursor-pointer ${className || ''}`}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className='text-xs'>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
