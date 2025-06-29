import type { Meta, StoryObj } from '@storybook/react';

import { ActionPlanContainer } from './action-plan-container';
import { mockActionPlan, mockTasks } from './test-data';

const meta = {
  title: 'ActionPlan/Container',
  component: ActionPlanContainer,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<typeof ActionPlanContainer>;

export default meta;

export const Default: StoryObj<typeof ActionPlanContainer> = {
  args: {
    actionPlan: mockActionPlan,
    tasks: mockTasks,
    isLoading: false,
    error: null
  }
};

export const Loading: StoryObj<typeof ActionPlanContainer> = {
  args: {
    actionPlan: undefined,
    tasks: undefined,
    isLoading: true,
    error: null
  }
};

export const Error: StoryObj<typeof ActionPlanContainer> = {
  args: {
    actionPlan: undefined,
    tasks: undefined,
    isLoading: false,
    error: {
      name: 'Error',
      message: 'Failed to load action plan'
    }
  }
};

export const EmptyState: StoryObj<typeof ActionPlanContainer> = {
  args: {
    actionPlan: undefined,
    tasks: undefined,
    isLoading: false,
    error: null
  }
};
