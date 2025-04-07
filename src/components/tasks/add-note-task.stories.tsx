import type { Meta, StoryObj } from '@storybook/react';

import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';

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
    task: {
      id: '123',
      person: {
        id: '456',
        first_name: 'Michael',
        last_name: 'Bashour'
      },
      trigger: TASK_TRIGGERS.CONTEXT_GATHER,
      completed_at: null,
      created_at: '2024-01-01T00:00:00Z',
      end_at: '2024-01-01T00:00:00Z',
      bad_suggestion: false,
      bad_suggestion_reason: null,
      skipped_at: null,
      snoozed_at: null,
      updated_at: '2024-01-01T00:00:00Z',
      context: {
        context: 'You recently had a lunch meeting with Michael',
        callToAction: 'Add a note recapping the meeting with any important details'
      },
      suggestedActionType: SUGGESTED_ACTION_TYPES.ADD_NOTE,
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
    }
  }
};
