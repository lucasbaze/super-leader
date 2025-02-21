import type { Meta, StoryObj } from '@storybook/react';

import { ToolCallIndicator } from './tool-call-indicator';

const meta: Meta<typeof ToolCallIndicator> = {
  title: 'ChatNext/ToolCallIndicator',
  component: ToolCallIndicator,
  parameters: {
    layout: 'padded'
  },
  decorators: [
    (Story) => (
      <div className='w-[300px] bg-background p-4'>
        <Story />
      </div>
    )
  ]
};

export default meta;
type Story = StoryObj<typeof ToolCallIndicator>;

const defaultArgs = {
  args: {
    name: 'John Doe',
    email: 'john@example.com',
    phoneNumber: '+1 (555) 123-4567',
    notes: 'Met at conference in Seattle'
  }
};

export const Loading: Story = {
  args: {
    toolName: 'findPerson',
    state: 'call',
    args: defaultArgs
  }
};

export const Completed: Story = {
  args: {
    toolName: 'findPerson',
    state: 'result',
    args: defaultArgs
  }
};

export const PartialCall: Story = {
  args: {
    toolName: 'findPerson',
    state: 'partial-call',
    args: defaultArgs
  }
};

export const WithoutArgs: Story = {
  args: {
    toolName: 'findPerson',
    state: 'result'
  }
};

export const LongToolName: Story = {
  args: {
    toolName: 'createMessageSuggestionsFromArticleForUser',
    state: 'call',
    args: defaultArgs
  }
};

export const ComplexArgs: Story = {
  args: {
    toolName: 'createInteraction',
    state: 'call',
    args: {
      person: {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com'
      },
      interaction: {
        type: 'meeting',
        date: '2024-03-20T15:00:00Z',
        notes: 'Quarterly review meeting\nDiscuss Q1 results\nPlan for Q2',
        location: 'Conference Room A'
      },
      metadata: {
        source: 'calendar',
        priority: 'high',
        tags: ['quarterly-review', 'planning', 'in-person']
      }
    }
  }
};
