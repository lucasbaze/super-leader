import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { createTestTask } from '@/lib/tasks/create-test-task';
import type { ActionPlanWithTaskIds } from '@/services/action-plan/schema';
import { GetTaskSuggestionResult } from '@/services/tasks/types';

// Pre-built mock tasks
export const mockTasks: GetTaskSuggestionResult[] = [
  createTestTask({
    id: 'task-1',
    context: {
      context:
        "It's been four months since your chat about touring Riot Platforms. Ask if he ever scheduled the visit and how Hippo Social Club's community vision is evolving.",
      callToAction: 'Follow up on tour & club'
    },
    person: {
      id: 'fa37fc95-f4ee-48d7-bf16-43d45bb51cc8',
      firstName: 'Sergio',
      lastName: 'Abbud'
    },
    trigger: TASK_TRIGGERS.FOLLOW_UP.slug,
    suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug
  }),
  createTestTask({
    id: 'task-2',
    context: {
      context:
        'Check how the accelerator program is going, offer intros to fintech/AI investors, and see how Alma and the baby are enjoying California.',
      callToAction: 'Support Payman.ai'
    },
    person: {
      id: '72c293d1-0656-4d22-96e3-b5e99a61baac',
      firstName: 'Tyllen',
      lastName: 'Bicakcic'
    },
    trigger: TASK_TRIGGERS.FOLLOW_UP.slug,
    suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug
  }),
  createTestTask({
    id: 'task-3',
    context: {
      context:
        'Congratulate him on the upcoming second child and ask how the Houston AI Club sessions are progressing; offer help or a guest talk.',
      callToAction: 'Celebrate family & AI'
    },
    person: {
      id: 'e2e368b8-b9f0-48ed-b428-57a0e7f238fd',
      firstName: 'Leon',
      lastName: 'Coe'
    },
    trigger: TASK_TRIGGERS.FOLLOW_UP.slug,
    suggestedActionType: SUGGESTED_ACTION_TYPES.SEND_MESSAGE.slug
  }),
  createTestTask({
    id: 'task-4',
    context: {
      context:
        'Send a recent article on sustainable drilling practices—ties his energy expertise with his CSR focus and sparks a meaningful discussion.',
      callToAction: 'Send article'
    },
    person: {
      id: 'ad2957b9-97dd-4a44-ad2c-1a573b8071c9',
      firstName: 'Bob',
      lastName: 'Warren'
    },
    trigger: TASK_TRIGGERS.CONTEXT_GATHER.slug,
    suggestedActionType: SUGGESTED_ACTION_TYPES.SHARE_CONTENT.slug
  }),
  createTestTask({
    id: 'task-5',
    context: {
      context:
        "Add note: confirm Michelle's birthday and current research focus at Arrae to raise profile completeness and enable more personalized follow-ups.",
      callToAction: 'Update profile'
    },
    person: {
      id: 'f5af6fc5-1049-4776-b324-9b9e2930b268',
      firstName: 'Michelle',
      lastName: 'Beygelman'
    },
    trigger: TASK_TRIGGERS.CONTEXT_GATHER.slug,
    suggestedActionType: SUGGESTED_ACTION_TYPES.ADD_NOTE.slug
  })
];

// Create tasksById lookup
export const mockTasksById = mockTasks.reduce(
  (acc, task) => {
    if (task.id) {
      acc[task.id] = task;
    }
    return acc;
  },
  {} as Record<string, GetTaskSuggestionResult>
);

// Mock action plan data
export const mockActionPlan: ActionPlanWithTaskIds = {
  buildDate: '2025-06-24',
  executiveSummary: {
    title: 'Keep the Central-50 momentum rolling',
    description:
      "Today's plan focuses on five quick touches that rekindle dormant threads, deepen context, and add value.",
    content:
      'A few thoughtful check-ins, one timely article share, and a profile clean-up will keep your network feeling seen and supported.'
  },
  groupSections: [
    {
      title: 'Quick Check-Ins',
      icon: '✉️',
      description: 'Short, personal messages to reignite conversation and show you care.',
      tasks: [
        {
          id: 'task-1',
          personId: 'fa37fc95-f4ee-48d7-bf16-43d45bb51cc8',
          personName: 'Sergio Abbud',
          taskTrigger: TASK_TRIGGERS.FOLLOW_UP.slug,
          taskContext:
            "It's been four months since your chat about touring Riot Platforms. Ask if he ever scheduled the visit and how Hippo Social Club's community vision is evolving.",
          taskType: 'send-message' as const,
          callToAction: 'Follow up on tour & club',
          taskDueDate: '2025-06-25T12:00:00Z'
        },
        {
          id: 'task-2',
          personId: '72c293d1-0656-4d22-96e3-b5e99a61baac',
          personName: 'Tyllen Bicakcic',
          taskTrigger: TASK_TRIGGERS.FOLLOW_UP.slug,
          taskContext:
            'Check how the accelerator program is going, offer intros to fintech/AI investors, and see how Alma and the baby are enjoying California.',
          taskType: 'send-message' as const,
          callToAction: 'Support Payman.ai',
          taskDueDate: '2025-06-25T12:00:00Z'
        },
        {
          id: 'task-3',
          personId: 'e2e368b8-b9f0-48ed-b428-57a0e7f238fd',
          personName: 'Leon Coe',
          taskTrigger: TASK_TRIGGERS.FOLLOW_UP.slug,
          taskContext:
            'Congratulate him on the upcoming second child and ask how the Houston AI Club sessions are progressing; offer help or a guest talk.',
          taskType: 'send-message' as const,
          callToAction: 'Celebrate family & AI',
          taskDueDate: '2025-06-25T12:00:00Z'
        }
      ]
    },
    {
      title: 'Value-Add Content',
      icon: '📄',
      description: 'Share relevant insight that aligns with their interests.',
      tasks: [
        {
          id: 'task-4',
          personId: 'ad2957b9-97dd-4a44-ad2c-1a573b8071c9',
          personName: 'Bob Warren',
          taskTrigger: TASK_TRIGGERS.CONTEXT_GATHER.slug,
          taskContext:
            'Send a recent article on sustainable drilling practices—ties his energy expertise with his CSR focus and sparks a meaningful discussion.',
          taskType: 'share-content' as const,
          callToAction: 'Send article',
          taskDueDate: '2025-06-25T12:00:00Z'
        }
      ]
    },
    {
      title: 'Profile Hygiene',
      icon: '📝',
      description: 'Capture missing data to strengthen future interactions.',
      tasks: [
        {
          id: 'task-5',
          personId: 'f5af6fc5-1049-4776-b324-9b9e2930b268',
          personName: 'Michelle Beygelman',
          taskTrigger: TASK_TRIGGERS.CONTEXT_GATHER.slug,
          taskContext:
            "Add note: confirm Michelle's birthday and current research focus at Arrae to raise profile completeness and enable more personalized follow-ups.",
          taskType: 'add-note' as const,
          callToAction: 'Update profile',
          taskDueDate: '2025-06-25T12:00:00Z'
        }
      ]
    }
  ],
  quote:
    '"Little by little, day by day, what is meant for you will find its way — especially when you help it along with genuine curiosity and care."'
};

// Simple group sections for ActionPlanTaskList (just IDs)
export const mockGroupSections = [
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
