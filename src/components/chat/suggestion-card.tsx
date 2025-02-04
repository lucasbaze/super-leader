import { ExternalLink, Newspaper, SendHorizontal } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

// TODO: Use the type from the server or types file
export interface TSuggestion {
  contentUrl: string;
  title: string;
  reason: string;
  category?: string;
}

interface SuggestionCardProps {
  suggestion: TSuggestion;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  return (
    <div className='flex items-center gap-2'>
      <Card className='w-full max-w-md'>
        {/* <CardHeader className='text-sm text-muted-foreground'>
          {suggestion.category || (
            <div className='flex'>
              <Newspaper className='mr-2 size-4' /> Share Article
            </div>
          )}
        </CardHeader> */}
        <CardContent className='space-y-2'>
          <h4 className='font-medium'>{suggestion.title}</h4>
          <p className='text-sm text-muted-foreground'>{suggestion.reason}</p>
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => window.open(suggestion.contentUrl, '_blank')}>
            <ExternalLink className='mr-2 size-4' />
            View Article
          </Button>
        </CardFooter>
      </Card>
      <Button variant='ghost' size='icon'>
        <SendHorizontal className='size-4' />
      </Button>
    </div>
  );
}
