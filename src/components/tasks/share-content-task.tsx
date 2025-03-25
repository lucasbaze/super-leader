'use client';

import { useState } from 'react';

import { z } from 'zod';

import { Clipboard, Edit, ExternalLink } from '@/components/icons';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { GetTaskSuggestionResult, shareContentActionSchema } from '@/services/tasks/types';

import { BaseTaskCard } from './base-task-card';

const isShareContentAction = (action: any): action is z.infer<typeof shareContentActionSchema> => {
  return 'contentVariants' in action;
};

export const ShareContentTask = ({ task }: { task: GetTaskSuggestionResult }) => {
  if (!isShareContentAction(task.suggested_action)) {
    return null;
  }

  return (
    <BaseTaskCard
      task={task}
      actionBody={
        <ShareContentCardActionBody contentVariants={task.suggested_action.contentVariants} />
      }
    />
  );
};

type ShareContentCardActionBodyProps = {
  contentVariants: z.infer<typeof shareContentActionSchema>['contentVariants'];
};

type ContentSectionState = {
  selectedToneIndex: number;
  editedMessage: string;
};

const ShareContentCardActionBody = ({ contentVariants }: ShareContentCardActionBodyProps) => {
  // Track state for each content variant separately
  const [contentStates, setContentStates] = useState<ContentSectionState[]>(
    contentVariants.map((content) => ({
      selectedToneIndex: 0,
      editedMessage: content.messageVariants[0].message
    }))
  );

  const updateContentState = (index: number, updates: Partial<ContentSectionState>) => {
    setContentStates((prev) =>
      prev.map((state, i) => (i === index ? { ...state, ...updates } : state))
    );
  };

  return (
    <Accordion type='single' defaultValue='0' collapsible>
      {contentVariants.map((content, contentIndex) => (
        <AccordionItem key={contentIndex} value={contentIndex.toString()} className='border-none'>
          <AccordionTrigger className='[&[data-state=open]]:bg-muted/30 mb-2 rounded-md border p-3 hover:no-underline'>
            <div className='flex items-center gap-2'>
              <div>
                <h4 className='text-sm font-medium'>{content.suggestedContent.title}</h4>
                <p className='line-clamp-1 text-left text-xs text-muted-foreground'>
                  {content.suggestedContent.description}
                </p>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className='px-3 pt-1'>
            <div className='space-y-4'>
              <div className='flex items-center'>
                <ExternalLink className='mr-2 size-3.5 text-primary' />
                <a
                  href={content.suggestedContent.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary'
                  onClick={(e) => e.stopPropagation()}>
                  {content.suggestedContent.url}
                </a>
              </div>
              {/* Message Tone Selection */}
              <div className='flex flex-wrap gap-2'>
                {content.messageVariants.map((variant, toneIndex) => (
                  <Button
                    key={toneIndex}
                    size='sm'
                    variant='outline'
                    className={cn(
                      'h-7 px-2 text-xs',
                      contentStates[contentIndex].selectedToneIndex === toneIndex && 'bg-muted'
                    )}
                    onClick={() => {
                      updateContentState(contentIndex, {
                        selectedToneIndex: toneIndex,
                        editedMessage: variant.message
                      });
                    }}>
                    {variant.tone}
                  </Button>
                ))}
              </div>

              {/* Message Editor */}
              <Textarea
                value={contentStates[contentIndex].editedMessage}
                onChange={(e) =>
                  updateContentState(contentIndex, { editedMessage: e.target.value })
                }
                rows={4}
                className='w-full resize-none'
                placeholder='Edit message...'
              />

              {/* Action Buttons */}
              <div className='flex flex-wrap justify-end gap-2'>
                <Button size='sm' variant='outline'>
                  <Clipboard className='mr-1 size-3.5' /> Copy
                </Button>
                <Button size='sm'>
                  <Edit className='mr-1 size-3.5' /> Edit in Chat
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
