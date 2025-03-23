'use client';

import { useState } from 'react';

import { CreateMessage } from 'ai';

import { Bookmark, ExternalLink, MessageCircle, ThumbsDown } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ContentSuggestionWithId } from '@/services/suggestions/types';

import { useSuggestionActions } from './use-suggestion-actions';

interface SuggestionCardProps {
  suggestion: ContentSuggestionWithId;
  append: (message: CreateMessage) => void;
}

export function SuggestionCard({ suggestion, append }: SuggestionCardProps) {
  const [viewed, setViewed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bad, setBad] = useState(false);
  const { handleSuggestionViewed, handleSuggestionBookmark, handleSuggestionDislike } =
    useSuggestionActions();

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
      <Card className='group relative w-full max-w-md'>
        {/* Action Buttons */}
        <div className='opacity-200 absolute bottom-2 right-2 flex gap-2 opacity-20 transition-opacity duration-200 group-hover:opacity-100'>
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn('size-8 hover:bg-accent', saved && 'text-primary')}
                  onClick={() => {
                    handleSuggestionBookmark(suggestion.id, !saved);
                    setSaved(!saved);
                  }}>
                  <Bookmark className='size-4' fill={saved ? 'currentColor' : 'none'} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{saved ? 'Remove bookmark' : 'Bookmark for later'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn('size-8 hover:bg-accent', bad && 'text-destructive')}
                  onClick={() => {
                    handleSuggestionDislike(suggestion.id, !bad);
                    setBad(!bad);
                  }}>
                  <ThumbsDown className='size-4' fill={bad ? 'currentColor' : 'none'} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{bad ? 'Remove dislike' : 'Bad suggestion'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

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
            className={cn(viewed && 'bg-accent/50')}
            onClick={() => {
              handleSuggestionViewed(suggestion.id);
              setViewed(true);
              window.open(suggestion.contentUrl, '_blank');
            }}>
            <ExternalLink className='mr-1 size-2' />
            {viewed ? 'Viewed' : 'View Article'}
          </Button>
        </CardFooter>
      </Card>
      <TooltipProvider>
        <Tooltip delayDuration={0}>
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
