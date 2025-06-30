import { useMemo } from 'react';

import { Progress } from '@/components/ui/progress';
import type { ActionPlanWithTaskIds } from '@/services/action-plan/schema';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';

interface ActionPlanProgressProps {
  actionPlan?: ActionPlanWithTaskIds;
  tasks?: GetTaskSuggestionResult[];
}

export function ActionPlanProgress({ actionPlan, tasks }: ActionPlanProgressProps) {
  // Calculate progress based on tasks
  const progress = useMemo(() => {
    if (!actionPlan || !tasks) return { completed: 0, total: 0, percentage: 0 };

    // Get all task IDs from action plan
    const actionPlanTaskIds = new Set<string>();
    actionPlan.groupSections.forEach((section) => {
      section.tasks.forEach((task) => {
        if (task.id) actionPlanTaskIds.add(task.id);
      });
    });

    // Filter tasks to only those in the action plan
    const actionPlanTasks = tasks.filter((task) => actionPlanTaskIds.has(task.id));
    const total = actionPlanTasks.length;

    // Count completed tasks (completed, skipped, or snoozed all count as "done")
    const completed = actionPlanTasks.filter((task) => task.completedAt || task.skippedAt || task.snoozedAt).length;

    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  }, [actionPlan, tasks]);

  // Don't render if there are no tasks
  if (progress.total === 0) {
    return null;
  }

  // Show stamp-like celebration indicator when 100% complete
  if (progress.percentage === 100) {
    return (
      <div className='absolute right-12 top-4 rotate-[10deg] transform'>
        <div className='flex size-32 flex-col items-center justify-center rounded-full border-4 border-green-500 bg-green-50 shadow-lg'>
          <div className='mb-1 animate-bounce text-4xl'>👍</div>
          <div className='mb-1 text-lg font-bold text-green-700'>All Done!</div>
          <div className='text-sm font-medium text-green-600'>{progress.completed} tasks</div>
        </div>
      </div>
    );
  }

  // Show normal progress bar
  return (
    <div className='mt-4'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-xs font-medium text-muted-foreground'>Daily Progress</span>
        <span className='text-xs text-muted-foreground'>
          {progress.completed} of {progress.total} tasks
        </span>
      </div>
      <Progress value={progress.percentage} className='h-2 bg-slate-200' />
    </div>
  );
}
