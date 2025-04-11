import { z } from 'zod';

import { CONTEXT_GATHERING_TYPES } from '@/lib/people/context-gathering';
import { SUGGESTED_ACTION_TYPES, SuggestedActionType, TASK_TRIGGERS, TaskTrigger } from '@/lib/tasks/constants';
import { Person, TaskSuggestion } from '@/types/database';
import { ServiceResponse } from '@/types/service-response';

export const taskContextSchema = z.object({
  context: z.string().describe('Context about the task (1 sentence max)'),
  callToAction: z.string().describe('The specific call to action to complete the task')
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
      type: z.enum(Object.values(QUESTION_TYPES) as [string, ...string[]]).describe('The type of question'),
      question: z.string().describe('The question to ask the person that will help you gather context about them.')
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
  userId: z.string().min(1).describe('The ID of the user the task is associated with'),
  personId: z.string().min(1).describe('The ID of the person the task is associated with'),
  trigger: z
    .enum(Object.values(TASK_TRIGGERS).map((trigger) => trigger.slug) as [TaskTrigger, ...TaskTrigger[]])
    .describe('The trigger for the creation of this task'),
  context: taskContextSchema,
  suggestedActionType: z
    .enum(
      Object.values(SUGGESTED_ACTION_TYPES).map((action) => action.slug) as [
        SuggestedActionType,
        ...SuggestedActionType[]
      ]
    )
    .describe('The type of action to take'),
  suggestedAction: z.union([
    sendMessageActionSchema,
    shareContentActionSchema,
    addNoteActionSchema,
    buyGiftActionSchema
  ]),
  endAt: z.string().datetime().describe('The ISO date-time string when the task should be completed')
});
export type CreateTaskSuggestion = z.infer<typeof taskSuggestionSchema>;

export type TaskContext = z.infer<typeof taskContextSchema>;

export type GetTaskSuggestionResult = Omit<
  TaskSuggestion,
  'trigger' | 'context' | 'suggested_action_type' | 'suggested_action' | 'person_id' | 'user_id'
> & {
  trigger: (typeof TASK_TRIGGERS)[keyof typeof TASK_TRIGGERS]['slug'];
  context: TaskContext;
  suggestedActionType: SuggestedActionType;
  suggestedAction: CreateTaskSuggestion['suggestedAction'];
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
export type UpdateTaskServiceResult = ServiceResponse<TaskUpdateResult>;

export type CreateTaskResult = {
  id: string;
  task: TaskSuggestion;
  success: boolean;
};

export type CreateTaskServiceResult = ServiceResponse<CreateTaskResult>;

export type BuildTaskResult = {
  task: TaskSuggestion;
};

export type BuildTaskServiceResult = ServiceResponse<BuildTaskResult>;
