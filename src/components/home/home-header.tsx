'use client';

import { BaseHeader } from '@/components/headers/base-header';
import { ListChecks, Loader } from '@/components/icons';
import { useGenerateTasks } from '@/hooks/use-tasks';

import { Button } from '../ui/button';

export function HomeHeader() {
  const generateTasks = useGenerateTasks();

  return (
    <BaseHeader className='flex flex-1 items-center justify-between'>
      <h2 className='text-md font-semibold text-muted-foreground'>Home</h2>
      <div className='flex items-center gap-2 pr-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => {
            // if (data?.person?.id) {
            generateTasks.mutate();
            // }
          }}
          disabled={generateTasks.isPending}>
          {generateTasks.isPending ? (
            <>
              <Loader className='mr-2 size-4 animate-spin' />
              Generating...
            </>
          ) : (
            <>
              <ListChecks className='mr-2 size-4' />
              Generate Tasks
            </>
          )}
        </Button>
      </div>
    </BaseHeader>
  );
}
