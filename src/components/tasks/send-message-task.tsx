'use client';

import { useState } from 'react';

import { Clipboard, Edit, User } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCopyToClipboard } from '@/hooks/utils/use-copy-to-clipboard';
import { cn } from '@/lib/utils';
import { GetTaskSuggestionResult, SendMessageAction } from '@/services/tasks/types';

import { BaseTaskCard } from './base-task-card';

const isSendMessageAction = (action: any): action is SendMessageAction => {
  return 'messageVariants' in action;
};

export const SendMessageTask = ({ task }: { task: GetTaskSuggestionResult }) => {
  if (!isSendMessageAction(task.suggestedAction)) {
    return null;
  }

  return (
    <BaseTaskCard
      task={task}
      actionBody={
        <SendMessageCardActionBody messageVariants={task.suggestedAction.messageVariants} />
      }
    />
  );
};

type SendMessageCardActionBodyProps = {
  messageVariants: SendMessageAction['messageVariants'];
};

const SendMessageCardActionBody = ({ messageVariants }: SendMessageCardActionBodyProps) => {
  const [editedContent, setEditedContent] = useState(messageVariants[0].message);
  const [selectedVariant, setSelectedVariant] = useState(messageVariants[0].tone);
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const handleCopy = async (message: string) => {
    await copyToClipboard(message);
  };

  return (
    <div className='space-y-3'>
      {messageVariants && (
        <div className='flex flex-wrap gap-2'>
          <p className='mb-1 w-full text-xs text-muted-foreground'>Message tone:</p>
          {messageVariants.map((variant: any, index: number) => (
            <Button
              key={index}
              size='sm'
              variant='outline'
              className={cn('h-7 px-2 text-xs', selectedVariant === variant.tone && 'bg-muted')}
              onClick={() => {
                setEditedContent(variant.message);
                setSelectedVariant(variant.tone);
              }}>
              {variant.tone.charAt(0).toUpperCase() + variant.tone.slice(1)}
            </Button>
          ))}
        </div>
      )}

      <Textarea
        value={editedContent}
        onChange={(e: any) => setEditedContent(e.target.value)}
        rows={3}
        className='w-full resize-none'
        placeholder='Edit message...'
      />

      <div className='space-y-3'>
        <div className='flex flex-wrap justify-end gap-2'>
          <Button size='sm' variant='outline'>
            {/* <Button size='sm' onClick={() => onOpenChat(task.person, editedContent)}> */}
            <Edit className='mr-1 size-3.5' /> Edit in Chat
          </Button>
          <Button size='sm' onClick={() => handleCopy(editedContent)}>
            <Clipboard className='mr-1 size-3.5' />
            <span className='transition-opacity duration-200 ease-in-out'>
              {isCopied ? 'Copied!' : 'Copy'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
