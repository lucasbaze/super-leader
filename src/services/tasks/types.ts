import { z } from 'zod';

import { CONTEXT_GATHERING_TYPES } from '@/lib/people/context-gathering';
import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { TASK_TYPES } from '@/lib/tasks/task-types';
import { Person, TaskSuggestion } from '@/types/database';
import { ServiceResponse } from '@/types/service-response';

export const taskContextSchema = z.object({
  context: z.string().describe('Context about the task (1 sentence max)'),
  callToAction: z
    .string()
    .describe(
      'The high level, context-specific call to action for completing the task (1 brief sentence max) such as "Send a birthday message" or "Share an interesting article about the Himalaya’s in reference to his upcoming trip"'
    )
});

export const sendMessageActionSchema = z.object({
  messageVariants: z.array(
    z.object({
      tone: z.string().describe('The tone of the message'),
      message: z.string().describe('The message to send')
    })
  )
});

export type SendMessageAction = z.infer<typeof sendMessageActionSchema>;

export const shareContentActionSchema = z.object({
  contentVariants: z.array(
    z.object({
      suggestedContent: z.object({
        title: z.string().describe('The title of the content (article, video, etc...)'),
        description: z.string().describe('The description of the content (article, video, etc...)'),
        url: z.string().describe('The URL of the content (article, video, etc...)')
      }),
      messageVariants: z.array(
        z.object({
          tone: z.string().describe('The tone of the message'),
          message: z.string().describe('The personalized message to send to the person')
        })
      )
    })
  )
});

const QUESTION_TYPES = CONTEXT_GATHERING_TYPES;

export const addNoteActionSchema = z.object({
  questionVariants: z.array(
    z.object({
      type: z
        .enum(Object.values(QUESTION_TYPES) as [string, ...string[]])
        .describe('The type of question'),
      question: z
        .string()
        .describe('The question to ask the person that will help you gather context about them.')
    })
  )
});

const GIFT_TYPES = ['funny', 'nice', 'experience'];

export const buyGiftActionSchema = z.object({
  suggestedGifts: z.array(
    z.object({
      title: z.string().describe('The title of the gift'),
      reason: z.string().describe('The reason for the gift'),
      url: z.string().describe('The URL of the gift'),
      type: z.enum(Object.values(GIFT_TYPES) as [string, ...string[]]).describe('The type of gift')
    })
  )
});

export const taskSuggestionSchema = z.object({
  user_id: z.string().min(1).describe('The ID of the user the task is associated with'),
  person_id: z.string().min(1).describe('The ID of the person the task is associated with'),
  trigger: z
    .enum(Object.values(TASK_TRIGGERS) as [string, ...string[]])
    .describe('The trigger for the creation of this task'),
  context: taskContextSchema,
  suggested_action_type: z
    .enum(Object.values(SUGGESTED_ACTION_TYPES) as [string, ...string[]])
    .describe('The type of action to take'),
  suggested_action: z.union([
    sendMessageActionSchema,
    shareContentActionSchema,
    addNoteActionSchema,
    buyGiftActionSchema
  ]),
  end_at: z
    .string()
    .datetime()
    .optional()
    .describe('The ISO date-time string when the task should be completed')
});

export type TaskContext = z.infer<typeof taskContextSchema>;

export type GetTaskSuggestionResult = Omit<
  TaskSuggestion,
  'trigger' | 'context' | 'suggested_action_type' | 'suggested_action' | 'person_id' | 'user_id'
> & {
  trigger: (typeof TASK_TRIGGERS)[keyof typeof TASK_TRIGGERS];
  context: TaskContext;
  suggested_action_type: z.infer<typeof taskSuggestionSchema>['suggested_action_type'];
  suggested_action: z.infer<typeof taskSuggestionSchema>['suggested_action'];
  person: Pick<Person, 'id' | 'first_name' | 'last_name'>;
};

export enum TaskActionType {
  COMPLETE = 'complete',
  SKIP = 'skip',
  SNOOZE = 'snooze',
  BAD_SUGGESTION = 'bad_suggestion'
}

export interface TaskUpdateResult {
  id: string;
  success: boolean;
}

export interface NewTaskParams {
  userId: string;
  personId: string;
  type: (typeof TASK_TYPES)[keyof typeof TASK_TYPES];
  content: TaskContext;
  endAt: string;
}

export type CreateTaskServiceResult = ServiceResponse<TaskUpdateResult>;
