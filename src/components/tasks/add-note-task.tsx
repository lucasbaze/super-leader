'use client';

import { useState } from 'react';

import { z } from 'zod';

import { Info } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { addNoteActionSchema, GetTaskSuggestionResult } from '@/services/tasks/types';

import { BaseTaskCard } from './base-task-card';

const isAddNoteAction = (action: any): action is z.infer<typeof addNoteActionSchema> => {
  return 'questionVariants' in action;
};

export const AddNoteTask = ({ task }: { task: GetTaskSuggestionResult }) => {
  if (!isAddNoteAction(task.suggested_action)) {
    return null;
  }

  return (
    <BaseTaskCard
      task={task}
      actionBody={
        <AddNoteCardActionBody questionVariants={task.suggested_action.questionVariants} />
      }
    />
  );
};

type AddNoteCardActionBodyProps = {
  questionVariants: z.infer<typeof addNoteActionSchema>['questionVariants'];
};

const AddNoteCardActionBody = ({ questionVariants }: AddNoteCardActionBodyProps) => {
  const [note, setNote] = useState('');
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>(
    questionVariants[0].type
  );

  const selectedQuestions = questionVariants.filter((q) => q.type === selectedQuestionType);

  return (
    <div className='space-y-4'>
      {/* Question Type Selection */}
      <div className='flex flex-wrap gap-2'>
        <p className='mb-1 w-full text-xs text-muted-foreground'>Thoughtful Questions:</p>
        {Array.from(new Set(questionVariants.map((q) => q.type))).map((type) => (
          <Button
            key={type}
            size='sm'
            variant='outline'
            className={cn('h-7 px-2 text-xs', selectedQuestionType === type && 'bg-muted')}
            onClick={() => setSelectedQuestionType(type)}>
            {type}
          </Button>
        ))}
      </div>

      {/* Question Prompts */}
      <div className='flex flex-col gap-2'>
        {selectedQuestions.map((question, index) => (
          <div key={index} className='flex items-center gap-2'>
            <Info className='mr-2 mt-0.5 size-3.5 shrink-0 text-muted-foreground' />
            <span className='text-xs text-muted-foreground'>{question.question}</span>
          </div>
        ))}
      </div>

      {/* Note Editor */}
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={6}
        className='w-full resize-none'
        placeholder='Add your note here...'
      />

      {/* Action Buttons */}
      <div className='flex justify-end'>
        <Button size='sm'>Save Note</Button>
      </div>
    </div>
  );
};
