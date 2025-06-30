'use client';

import { useMemo } from 'react';

import { Loader } from '@/components/icons';
import type { ActionPlanWithTaskIds } from '@/services/action-plan/schema';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';

import { ActionPlanTaskList } from './action-plan-list';
import { ActionPlanProgress } from './action-plan-progress';

interface ActionPlanContainerProps {
  actionPlan?: ActionPlanWithTaskIds;
  tasks?: GetTaskSuggestionResult[];
  isLoading?: boolean;
  error?: Error | null;
}

export function ActionPlanContainer({ actionPlan, tasks, isLoading = false, error = null }: ActionPlanContainerProps) {
  // Build a map of taskId -> task for fast lookup
  const tasksById = useMemo(() => {
    if (!tasks) return {};
    const map: Record<string, GetTaskSuggestionResult> = {};
    tasks.forEach((task) => {
      if (task.id) map[task.id] = task;
    });
    return map;
  }, [tasks]);

  // Render header content based on state
  const renderHeaderContent = () => {
    if (isLoading) {
      return (
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Loader className='size-4 animate-spin' /> Loading your action plan...
        </div>
      );
    }

    if (error) {
      return <div className='text-red-500'>Failed to load action plan</div>;
    }

    if (actionPlan) {
      return (
        <div className='mb-2'>
          <div className='mb-1 text-lg font-semibold'>{actionPlan.executiveSummary.title}</div>
          <div className='mb-1 text-base sm:max-w-[90%] md:max-w-[60%]'>{actionPlan.executiveSummary.description}</div>
          <ActionPlanProgress actionPlan={actionPlan} tasks={tasks} />
        </div>
      );
    }

    return null;
  };

  // Render main content based on state
  const renderMainContent = () => {
    if (isLoading) {
      return (
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Loader className='size-4 animate-spin' /> Loading tasks...
        </div>
      );
    }

    if (error) {
      return <div className='text-red-500'>Failed to load tasks</div>;
    }

    if (actionPlan) {
      return <ActionPlanTaskList groupSections={actionPlan.groupSections} tasksById={tasksById} />;
    }

    return <div className='text-muted-foreground'>No action plan available for today.</div>;
  };

  return (
    <div className='relative flex flex-col'>
      <div className='border-b bg-background px-8 pb-6 pt-2'>
        <h1 className='mb-1 text-2xl font-bold'>Good Morning</h1>
        <div className='mb-2 text-sm text-muted-foreground'>
          {new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        {renderHeaderContent()}
      </div>
      <div className='flex-1 overflow-y-auto px-8 py-6'>{renderMainContent()}</div>
    </div>
  );
}
