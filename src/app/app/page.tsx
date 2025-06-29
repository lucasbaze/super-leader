'use client';

import { useMemo } from 'react';

import { Loader } from '@/components/icons';
import { ActionPlanTaskList } from '@/components/tasks/action-plan-task-list';
import { useActionPlan } from '@/hooks/use-action-plan';

export default function ActionPlanHomePage() {
  const { data, isLoading, error } = useActionPlan();

  // Build a map of taskId -> task for fast lookup
  const tasksById = useMemo(() => {
    if (!data?.tasks) return {};
    const map: Record<string, any> = {};
    data.tasks.forEach((task) => {
      if (task.id) map[task.id] = task;
    });
    return map;
  }, [data?.tasks]);

  return (
    <div className='absolute inset-0 flex flex-col'>
      <div className='border-b bg-background px-8 py-6'>
        <h1 className='mb-1 text-2xl font-bold'>Good Morning</h1>
        <div className='mb-2 text-sm text-muted-foreground'>
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        {isLoading ? (
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Loader className='size-4 animate-spin' /> Loading your action plan...
          </div>
        ) : error ? (
          <div className='text-red-500'>Failed to load action plan</div>
        ) : data && data.actionPlan ? (
          <div className='mb-2'>
            <div className='mb-1 text-lg font-semibold'>{data.actionPlan.executiveSummary.title}</div>
            <div className='mb-1 text-base'>{data.actionPlan.executiveSummary.description}</div>
            <div className='text-sm text-muted-foreground'>{data.actionPlan.executiveSummary.content}</div>
          </div>
        ) : null}
      </div>
      <div className='flex-1 overflow-y-auto px-8 py-6'>
        {isLoading ? (
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Loader className='size-4 animate-spin' /> Loading tasks...
          </div>
        ) : error ? (
          <div className='text-red-500'>Failed to load tasks</div>
        ) : data && data.actionPlan ? (
          <ActionPlanTaskList groupSections={data.actionPlan.groupSections} tasksById={tasksById} />
        ) : (
          <div className='text-muted-foreground'>No action plan available for today.</div>
        )}
      </div>
    </div>
  );
}
