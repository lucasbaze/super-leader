'use client';

import { useParams } from 'next/navigation';

import { TaskSuggestionListItem } from '@/components/home/task-suggestion-list-item';
import { useTasks } from '@/hooks/use-tasks';
import { filterAllTasks, groupTasksByTimeframe } from '@/lib/tasks/task-groups';

export default function PersonTasksPage() {
  const params = useParams();
  const { data: tasks, isLoading, error } = useTasks(params.id as string);

  // Filter and group tasks
  const filteredTasks = tasks ? filterAllTasks(tasks) : [];
  const taskGroups = filteredTasks ? groupTasksByTimeframe(filteredTasks) : [];

  return (
    <div className='flex-1 overflow-auto'>
      <div className='p-4'>
        {isLoading ? (
          <div className='text-sm text-muted-foreground'>Loading tasks...</div>
        ) : error ? (
          <div className='text-sm text-red-500'>Failed to load tasks</div>
        ) : !filteredTasks?.length ? (
          <div className='text-sm text-muted-foreground'>No tasks available</div>
        ) : (
          <div className='space-y-6'>
            {taskGroups.map((group) => (
              <div key={group.title}>
                <h3 className='mb-3 text-lg font-semibold'>{group.title}</h3>
                <div className='space-y-4'>
                  {group.tasks.map((task) => (
                    <TaskSuggestionListItem key={task.id} task={task} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
