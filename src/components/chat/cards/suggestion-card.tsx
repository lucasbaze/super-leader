import { CreateMessage } from 'ai';

import { ExternalLink, MessageCircle, Newspaper, SendHorizontal } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// TODO: Use the type from the server or types file
export interface TSuggestion {
  contentUrl: string;
  title: string;
  reason: string;
  category?: string;
  append: (message: CreateMessage) => void;
}

interface SuggestionCardProps {
  suggestion: TSuggestion;
  append: (message: CreateMessage) => void;
}

export function SuggestionCard({ suggestion, append }: SuggestionCardProps) {
  const handleAppend = () => {
    const prompt = 'Please create message variants based on the following content:';

    append({
      role: 'user',
      content: `${prompt} ${suggestion.title}`,
      data: {
        contentUrl: suggestion.contentUrl,
        contentTitle: suggestion.title
      }
    });
  };

  return (
    <div className='flex items-center gap-2'>
      <Card className='w-full max-w-md'>
        <CardHeader className='text-sm text-muted-foreground'>
          <h4 className='font-medium'>{suggestion.title}</h4>
        </CardHeader>
        <CardContent className='space-y-2'>
          <p className='text-sm text-muted-foreground'>{suggestion.reason}</p>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => window.open(suggestion.contentUrl, '_blank')}>
            <ExternalLink className='mr-1 size-2' />
            View Article
          </Button>
        </CardFooter>
      </Card>
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' onClick={handleAppend}>
              <MessageCircle className='size-4' />
            </Button>
          </TooltipTrigger>
          <TooltipContent className='max-w-[150px] text-center'>
            <p>Create sample messages for this</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
