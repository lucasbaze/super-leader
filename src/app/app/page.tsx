'use client';

import { HomeHeader } from '@/components/home/home-header';
import { TaskSuggestionCard } from '@/components/home/task-suggestion-card';
import { TaskSuggestionListItem } from '@/components/home/task-suggestion-list-item';
import { useTasks } from '@/hooks/use-tasks';

export default function HomePage() {
  const { data: tasks, isLoading, error } = useTasks();

  // We'll use these values later when we implement the UI
  console.log({ tasks, isLoading, error });

  return (
    <div className='absolute inset-0'>
      <HomeHeader />
      <div className='absolute inset-0 top-[48px] mt-[1px] overflow-auto'>
        <div className='p-4'>
          {isLoading ? (
            <div className='text-sm text-muted-foreground'>Loading tasks...</div>
          ) : error ? (
            <div className='text-sm text-red-500'>Failed to load tasks</div>
          ) : !tasks?.length ? (
            <div className='text-sm text-muted-foreground'>No tasks available</div>
          ) : (
            <div className='space-y-4'>
              {tasks.map((task) => (
                <TaskSuggestionListItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
