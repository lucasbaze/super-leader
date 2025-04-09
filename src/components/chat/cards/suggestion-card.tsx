'use client';

import { useState } from 'react';

import { Bookmark, ChevronDown, Clipboard, ExternalLink, MessageCircle, ThumbsDown } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCopyToClipboard } from '@/hooks/utils/use-copy-to-clipboard';
import { cn } from '@/lib/utils';
import { Suggestion } from '@/types/custom';

import { useSuggestionActions } from './use-suggestion-actions';

interface SuggestionCardProps {
  suggestion: Suggestion;
}

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const [viewed, setViewed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [bad, setBad] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedToneIndex, setSelectedToneIndex] = useState(0);
  const [editedMessage, setEditedMessage] = useState('');
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const { handleSuggestionViewed, handleSuggestionBookmark, handleSuggestionDislike } = useSuggestionActions();

  // Initialize edited message with the first message variant
  useState(() => {
    if (suggestion.suggestion.messageVariants.length > 0) {
      setEditedMessage(suggestion.suggestion.messageVariants[0].message);
    }
  });

  const contentVariant = suggestion.suggestion;

  const handleCopy = async (message: string) => {
    copyToClipboard(message);
  };

  return (
    <Card className='group relative w-full max-w-[90%]'>
      <CardHeader className='text-sm text-muted-foreground'>
        <h4 className='font-medium'>{contentVariant.suggestedContent.title}</h4>
      </CardHeader>
      <CardContent className='space-y-2'>
        <p className='line-clamp-3 text-sm text-muted-foreground'>{contentVariant.suggestedContent.description}</p>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <Button
          variant='ghost'
          size='sm'
          className={cn(viewed && 'bg-accent/50')}
          onClick={() => {
            handleSuggestionViewed(suggestion.id);
            setViewed(true);
            window.open(contentVariant.suggestedContent.url, '_blank');
          }}>
          <ExternalLink className='mr-1 size-2' />
          {viewed ? 'Viewed' : 'View Article'}
        </Button>
        <div className='opacity-200 flex gap-2 opacity-20 transition-opacity duration-200 group-hover:opacity-100'>
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
      </CardFooter>

      {/* Messages Section */}
      <div
        className='border-border/50 hover:bg-muted/50 flex cursor-pointer items-center border-t px-4 py-2 transition-colors'
        onClick={() => setIsExpanded(!isExpanded)}>
        <Button
          variant='ghost'
          size='sm'
          className={cn('mr-2 size-6 p-0 transition-transform duration-200', isExpanded && 'rotate-180')}>
          <ChevronDown className='size-4' />
        </Button>
        <p className='flex flex-1 items-center text-sm'>
          Message options <MessageCircle className='ml-2 size-3' />
        </p>
      </div>

      {/* Expandable Content */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        )}>
        <div className='border-border/50 bg-muted/20 border-t px-4 py-3'>
          <div className='space-y-4'>
            {/* Message Tone Selection */}
            <div className='flex flex-wrap gap-2'>
              {contentVariant.messageVariants.map((variant, toneIndex) => (
                <Button
                  key={toneIndex}
                  size='sm'
                  variant='outline'
                  className={cn('h-7 px-2 text-xs', selectedToneIndex === toneIndex && 'bg-muted')}
                  onClick={() => {
                    setSelectedToneIndex(toneIndex);
                    setEditedMessage(variant.message);
                  }}>
                  {variant.tone.charAt(0).toUpperCase() + variant.tone.slice(1)}
                </Button>
              ))}
            </div>

            {/* Message Editor */}
            <div className='space-y-2'>
              <Textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                rows={6}
                className='border-grey w-full resize-none'
                placeholder='Edit message...'
              />
              <div className='flex justify-end'>
                <Button size='sm' onClick={() => handleCopy(editedMessage)}>
                  <Clipboard className='mr-1 size-3.5' />
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
