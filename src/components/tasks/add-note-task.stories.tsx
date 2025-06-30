import type { Meta, StoryObj } from '@storybook/react';

import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { createTestTask } from '@/lib/tasks/create-test-task';

import { AddNoteTask } from './add-note-task';

const meta = {
  title: 'Tasks/AddNoteTask',
  component: AddNoteTask,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof AddNoteTask>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    task: createTestTask({
      id: '123',
      person: {
        id: '456',
        firstName: 'Michael',
        lastName: 'Bashour'
      },
      trigger: TASK_TRIGGERS.CONTEXT_GATHER.slug,
      context: {
        context: 'You recently had a lunch meeting with Michael',
        callToAction: 'Add a note recapping the meeting with any important details'
      },
      suggestedActionType: SUGGESTED_ACTION_TYPES.ADD_NOTE.slug,
      suggestedAction: {
        questionVariants: [
          {
            type: 'Personal',
            question: 'What personal interests or hobbies did Michael mention?'
          },
          {
            type: 'Professional',
            question: 'What current projects is Michael working on?'
          },
          {
            type: 'Goals',
            question: 'What specific milestones is Michael aiming to achieve?'
          },
          {
            type: 'Insights',
            question: 'What unique perspectives or ideas did Michael contribute?'
          }
        ]
      }
    })
  }
};
