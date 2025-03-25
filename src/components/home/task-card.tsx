'use client';

import { useState } from 'react';

import {
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clipboard,
  Clock,
  Edit,
  ExternalLink,
  Gift,
  Info,
  Loader,
  MessageSquare,
  Share,
  User,
  X
} from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTaskActions } from '@/hooks/use-task-actions';
import { getTaskDateDisplay } from '@/lib/dates/task-dates';
import { routes } from '@/lib/routes';
import { TASK_METADATA } from '@/lib/tasks/task-meta';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';

export function TaskCard({
  task,
  onCopy,
  onOpenChat,
  contactInfo,
  setContactInfo,
  onTaskAction
}: {
  task: any;
  onCopy: (content: string) => void;
  onOpenChat: (person: any, content: string) => void;
  contactInfo: { email: string; phone: string };
  setContactInfo: (info: { email: string; phone: string }) => void;
  onTaskAction: (action: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const { completeTask, skipTask, isLoading } = useTaskActions();

  const handleAction = async (action: () => Promise<any>, actionName: string) => {
    try {
      setActionInProgress(actionName);
      await action();
    } finally {
      setActionInProgress(null);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return <Gift className='h-4 w-4' />;
      case 'profile_update':
        return <User className='h-4 w-4' />;
      case 'content_share':
        return <Share className='h-4 w-4' />;
      case 'follow_up':
        return <MessageSquare className='h-4 w-4' />;
      default:
        return <Info className='h-4 w-4' />;
    }
  };

  return (
    <Card className='relative w-full min-w-[500px] overflow-hidden'>
      {/* Card Header - Always visible */}
      <div className='group p-4'>
        <div className='flex items-start'>
          <Avatar className='mr-4 h-10 w-10 flex-shrink-0'>
            <AvatarImage src={task.person.avatar} alt={task.person.name} />
            <AvatarFallback>{task.person.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className='min-w-0 flex-1'>
            <div className='flex items-start justify-between'>
              <h3 className='font-medium'>{task.person.name}</h3>
              <span className='text-sm text-muted-foreground'>Today</span>
            </div>

            <div className='mt-1 flex items-center justify-between'>
              <div className='flex items-center text-sm text-muted-foreground'>
                {getActionIcon(task.type)}
                <span className='ml-1'>{task.context}</span>
              </div>

              <div className='flex items-center gap-2'>
                {/* Actions (visible on hover) */}
                <div className='flex translate-x-4 items-center gap-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100'>
                  <TooltipProvider>
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='size-7 rounded-full p-0'
                          title='Complete'
                          onClick={(e) => {
                            e.preventDefault();
                            handleAction(() => completeTask(task.id), 'complete');
                          }}
                          disabled={isLoading || actionInProgress !== null}>
                          {isLoading ? (
                            <Loader className='size-4 animate-spin' />
                          ) : (
                            <Check className='size-3.5 text-green-500' />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Complete task</TooltipContent>
                    </Tooltip>
                    {/* <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-7 w-7 rounded-full p-0'
                          onClick={() => onTaskAction('snooze')}
                          title='Snooze'>
                          <Clock className='h-3.5 w-3.5 text-amber-500' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Snooze task</TooltipContent>
                    </Tooltip> */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='size-7 rounded-full p-0'
                          onClick={(e) => {
                            e.preventDefault();
                            handleAction(() => skipTask(task.id), 'skip');
                          }}
                          title='Skip'
                          disabled={isLoading || actionInProgress !== null}>
                          {isLoading ? (
                            <Loader className='size-4 animate-spin' />
                          ) : (
                            <X className='size-3.5 text-red-500' />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Skip task</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion Header - Context with expand/collapse control */}
      <div
        className='border-border/50 hover:bg-muted/50 flex cursor-pointer items-center border-t px-4 py-2 transition-colors'
        onClick={() => setIsExpanded(!isExpanded)}>
        <Button variant='ghost' size='sm' className='mr-2 size-6 p-0'>
          {isExpanded ? <ChevronDown className='size-4' /> : <ChevronRight className='size-4' />}
        </Button>
        <p className='flex-1 text-sm'>{task.suggestedAction}</p>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className='border-border/50 bg-muted/20 border-t px-4 py-3'>
          <div className='space-y-4'>
            <div className='bg-muted/50 rounded-md p-3'>
              <p className='text-sm'>{task.suggestedContent}</p>
            </div>

            {task.type === 'content_share' && task.contentSuggestions && (
              <div className='space-y-2'>
                <p className='text-sm font-medium'>Suggested Content:</p>
                <div className='space-y-3'>
                  {task.contentSuggestions.map((content: any, index: number) => (
                    <div key={index} className='bg-muted/30 rounded-md p-3'>
                      <div className='flex items-start justify-between'>
                        <h4 className='text-sm font-medium'>{content.title}</h4>
                        <a
                          href={content.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='hover:text-primary/80 text-primary'>
                          <ExternalLink className='h-3.5 w-3.5' />
                        </a>
                      </div>
                      <p className='mt-1 text-xs text-muted-foreground'>{content.description}</p>
                      <a
                        href={content.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='mt-2 flex items-center gap-1 text-xs text-primary'>
                        <Info className='h-3 w-3' />
                        {content.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {task.type === 'birthday' && (
              <div className='space-y-3'>
                <Textarea
                  value={editedContent}
                  onChange={(e: any) => setEditedContent(e.target.value)}
                  rows={3}
                  className='w-full resize-none'
                  placeholder='Edit birthday message...'
                />

                <div className='space-y-3'>
                  <div className='flex flex-wrap gap-2'>
                    <Button size='sm' variant='outline' onClick={() => onCopy(editedContent)}>
                      <Clipboard className='mr-1 h-3.5 w-3.5' /> Copy
                    </Button>
                    <Button size='sm' onClick={() => onOpenChat(task.person, editedContent)}>
                      <Edit className='mr-1 h-3.5 w-3.5' /> Edit in Chat
                    </Button>
                  </div>

                  {task.messageVariants && (
                    <div className='flex flex-wrap gap-2'>
                      <p className='mb-1 w-full text-xs text-muted-foreground'>Message tone:</p>
                      {task.messageVariants.map((variant: any, index: number) => (
                        <Button
                          key={index}
                          size='sm'
                          variant='outline'
                          className='h-7 px-2 text-xs'
                          onClick={() => setEditedContent(variant.content)}>
                          {variant.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {!task.person.contactInfo.email && !task.person.contactInfo.phone && (
                  <div className='mt-3 space-y-2 border-t pt-3'>
                    <p className='text-sm text-amber-600'>No contact information available</p>
                    <div className='grid grid-cols-1 gap-2'>
                      <Label htmlFor='email' className='text-xs'>
                        Email
                      </Label>
                      <Input
                        id='email'
                        value={contactInfo.email}
                        onChange={(e: any) =>
                          setContactInfo({ ...contactInfo, email: e.target.value })
                        }
                        placeholder='Enter email address'
                        className='h-8'
                      />
                    </div>
                    <div className='grid grid-cols-1 gap-2'>
                      <Label htmlFor='phone' className='text-xs'>
                        Phone
                      </Label>
                      <Input
                        id='phone'
                        value={contactInfo.phone}
                        onChange={(e: any) =>
                          setContactInfo({ ...contactInfo, phone: e.target.value })
                        }
                        placeholder='Enter phone number'
                        className='h-8'
                      />
                    </div>
                    <Button size='sm' className='w-full'>
                      <User className='mr-1 h-3.5 w-3.5' /> Save Contact Info
                    </Button>
                  </div>
                )}
              </div>
            )}

            {task.type === 'profile_update' && (
              <div className='space-y-3'>
                <Textarea
                  value={editedContent}
                  onChange={(e: any) => setEditedContent(e.target.value)}
                  rows={4}
                  className='w-full resize-none'
                  placeholder='Add profile information...'
                />
                <Button size='sm'>
                  <Check className='mr-1 h-3.5 w-3.5' /> Save Updates
                </Button>
              </div>
            )}

            {(task.type === 'content_share' || task.type === 'follow_up') && (
              <div className='space-y-3'>
                <Textarea
                  value={editedContent}
                  onChange={(e: any) => setEditedContent(e.target.value)}
                  rows={3}
                  className='w-full resize-none'
                  placeholder='Edit message...'
                />

                <div className='space-y-3'>
                  <div className='flex flex-wrap gap-2'>
                    <Button size='sm' variant='outline' onClick={() => onCopy(editedContent)}>
                      <Clipboard className='mr-1 h-3.5 w-3.5' /> Copy
                    </Button>
                    <Button size='sm' onClick={() => onOpenChat(task.person, editedContent)}>
                      <Edit className='mr-1 h-3.5 w-3.5' /> Edit in Chat
                    </Button>
                  </div>

                  {task.messageVariants && (
                    <div className='flex flex-wrap gap-2'>
                      <p className='mb-1 w-full text-xs text-muted-foreground'>Message tone:</p>
                      {task.messageVariants.map((variant: any, index: number) => (
                        <Button
                          key={index}
                          size='sm'
                          variant='outline'
                          className='h-7 px-2 text-xs'
                          onClick={() => setEditedContent(variant.content)}>
                          {variant.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
