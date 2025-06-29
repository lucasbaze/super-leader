import type { Meta, StoryObj } from '@storybook/react';

import { ActionPlanTaskList } from './action-plan-list';
import { mockGroupSections, mockTasksById } from './test-data';

const meta = {
  title: 'ActionPlan/TaskList',
  component: ActionPlanTaskList,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof ActionPlanTaskList>;

export default meta;

export const Default: StoryObj<typeof ActionPlanTaskList> = {
  render: () => (
    <div className='w-[800px] p-6'>
      <ActionPlanTaskList groupSections={mockGroupSections} tasksById={mockTasksById} />
    </div>
  )
};

export const EmptyState: StoryObj<typeof ActionPlanTaskList> = {
  args: {
    groupSections: [],
    tasksById: {}
  }
};
