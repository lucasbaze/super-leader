import type { Meta, StoryObj } from '@storybook/react';

import { dateHandler } from '@/lib/dates/helpers';
import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { GetTaskSuggestionResult } from '@/services/tasks/types';

import { ActionPlanTaskList } from './action-plan-list';

const meta = {
  title: 'ActionPlan/TaskList',
  component: ActionPlanTaskList,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof ActionPlanTaskList>;

export default meta;

// Helper function to create test tasks
function createTestTask(overrides = {}): GetTaskSuggestionResult {
  return {
    id: '1',
    trigger: TASK_TRIGGERS.FOLLOW_UP.slug,
    context: {
      context: 'Follow up on project discussion',
      callToAction: 'Send a message to check on project progress'
    },
    end_at: dateHandler().toISOString(),
    completed_at: null,
    skipped_at: null,
    snoozed_at: null,
    created_at: dateHandler().subtract(1, 'day').toISOString(),
    updated_at: dateHandler().subtract(1, 'day').toISOString(),
    person: {
      id: '123',
      first_name: 'John',
      last_name: 'Doe'
    },
    bad_suggestion: null,
    bad_suggestion_reason: null,
    suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug,
    suggestedAction: {
      messageVariants: [
        {
          tone: 'friendly',
          message: 'Hey, how is the project going?'
        }
      ]
    },
    ...overrides
  };
}

export const Default: StoryObj<typeof ActionPlanTaskList> = {
  render: () => {
    // Create test tasks with unique IDs
    const task1 = createTestTask({
      id: 'task-1',
      context: {
        context:
          "It's been four months since your chat about touring Riot Platforms. Ask if he ever scheduled the visit and how Hippo Social Club's community vision is evolving.",
        callToAction: 'Follow up on tour & club'
      },
      person: {
        id: 'fa37fc95-f4ee-48d7-bf16-43d45bb51cc8',
        first_name: 'Sergio',
        last_name: 'Abbud'
      },
      trigger: TASK_TRIGGERS.FOLLOW_UP.slug,
      suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug
    });

    const task2 = createTestTask({
      id: 'task-2',
      context: {
        context:
          'Check how the accelerator program is going, offer intros to fintech/AI investors, and see how Alma and the baby are enjoying California.',
        callToAction: 'Support Payman.ai'
      },
      person: {
        id: '72c293d1-0656-4d22-96e3-b5e99a61baac',
        first_name: 'Tyllen',
        last_name: 'Bicakcic'
      },
      trigger: TASK_TRIGGERS.FOLLOW_UP.slug,
      suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug
    });

    const task3 = createTestTask({
      id: 'task-3',
      context: {
        context:
          'Congratulate him on the upcoming second child and ask how the Houston AI Club sessions are progressing; offer help or a guest talk.',
        callToAction: 'Celebrate family & AI'
      },
      person: {
        id: 'e2e368b8-b9f0-48ed-b428-57a0e7f238fd',
        first_name: 'Leon',
        last_name: 'Coe'
      },
      trigger: TASK_TRIGGERS.FOLLOW_UP.slug,
      suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug
    });

    const task4 = createTestTask({
      id: 'task-4',
      context: {
        context:
          'Send a recent article on sustainable drilling practices—ties his energy expertise with his CSR focus and sparks a meaningful discussion.',
        callToAction: 'Send article'
      },
      person: {
        id: 'ad2957b9-97dd-4a44-ad2c-1a573b8071c9',
        first_name: 'Bob',
        last_name: 'Warren'
      },
      trigger: TASK_TRIGGERS.CONTEXT_GATHER.slug,
      suggestedActionType: SUGGESTED_ACTION_TYPES.SHARE_CONTENT.slug
    });

    const task5 = createTestTask({
      id: 'task-5',
      context: {
        context:
          "Add note: confirm Michelle's birthday and current research focus at Arrae to raise profile completeness and enable more personalized follow-ups.",
        callToAction: 'Update profile'
      },
      person: {
        id: 'f5af6fc5-1049-4776-b324-9b9e2930b268',
        first_name: 'Michelle',
        last_name: 'Beygelman'
      },
      trigger: TASK_TRIGGERS.CONTEXT_GATHER.slug,
      suggestedActionType: SUGGESTED_ACTION_TYPES.ADD_NOTE.slug
    });

    // Create tasksById lookup
    const tasksById = {
      'task-1': task1,
      'task-2': task2,
      'task-3': task3,
      'task-4': task4,
      'task-5': task5
    };

    // Create group sections matching the raw-action-plan.json structure
    const groupSections = [
      {
        title: 'Quick Check-Ins',
        icon: '✉️',
        description: 'Short, personal messages to reignite conversation and show you care.',
        tasks: [{ id: 'task-1' }, { id: 'task-2' }, { id: 'task-3' }]
      },
      {
        title: 'Value-Add Content',
        icon: '📄',
        description: 'Share relevant insight that aligns with their interests.',
        tasks: [{ id: 'task-4' }]
      },
      {
        title: 'Profile Hygiene',
        icon: '📝',
        description: 'Capture missing data to strengthen future interactions.',
        tasks: [{ id: 'task-5' }]
      }
    ];

    return (
      <div className='w-[800px] p-6'>
        <ActionPlanTaskList groupSections={groupSections} tasksById={tasksById} />
      </div>
    );
  }
};

export const EmptyState: StoryObj<typeof ActionPlanTaskList> = {
  args: {
    groupSections: [],
    tasksById: {}
  }
};
