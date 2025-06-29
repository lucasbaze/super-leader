import { TaskRenderer } from '@/components/tasks/task-renderer';
import type { ActionPlanWithTaskIds } from '@/services/action-plan/schema';
import type { GetTaskSuggestionResult } from '@/services/tasks/types';

interface ActionPlanTaskListProps {
  groupSections: ActionPlanWithTaskIds['groupSections'] | any[];
  tasksById: Record<string, GetTaskSuggestionResult>;
}

export function ActionPlanTaskList({ groupSections, tasksById }: ActionPlanTaskListProps) {
  if (!groupSections?.length) {
    return <div className='text-sm text-muted-foreground'>No actions for today</div>;
  }

  return (
    <div className='space-y-10'>
      {groupSections.map((group, idx) => (
        <div key={group.title} className='mb-8'>
          <div className='mb-2 flex items-center gap-2'>
            <span className='text-xl'>{group.icon}</span>
            <h2 className='text-lg font-semibold'>{group.title}</h2>
          </div>
          <div className='mb-4 text-sm text-muted-foreground'>{group.description}</div>
          <div className='space-y-4 pl-2'>
            {group.tasks.map((task: GetTaskSuggestionResult) => {
              const realTask = task.id && tasksById[task.id];
              return realTask ? (
                <TaskRenderer key={task.id} task={realTask} />
              ) : (
                <div key={task.id} className='text-xs text-red-400'>
                  Task not found
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
