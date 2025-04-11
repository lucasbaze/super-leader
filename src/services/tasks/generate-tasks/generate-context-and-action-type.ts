import { stripIndent } from 'common-tags';
import { z } from 'zod';

import {
  SUGGESTED_ACTION_TYPES,
  SuggestedActionType,
  suggestedActionTypeDescriptions,
  suggestedActionTypeSlugs,
  TaskTrigger,
  taskTriggerDescriptions,
  taskTriggerSlugs
} from '@/lib/tasks/constants';
import { Person } from '@/types/database';
import { generateObject } from '@/vendors/ai';

import { SendMessageAction, sendMessageActionSchema, TaskContext, taskContextSchema } from '../types';

interface GenerateContextAndActionTypeParams {
  person: Person;
  trigger: TaskTrigger;
  personContext: string;
  taskContext?: string;
}

export const generateContextAndActionType = async ({
  person,
  trigger,
  taskContext,
  personContext
}: GenerateContextAndActionTypeParams): Promise<TaskContext & { actionType: SuggestedActionType }> => {
  const taskContextAndActionType = await generateObject({
    schema: taskContextSchema.extend({
      actionType: z.enum(suggestedActionTypeSlugs as [string, ...string[]]).describe('The type of action to suggest')
    }),
    prompt: stripIndent`
    Your objective is to determine the type of suggested action to take for ${person.first_name} based on the task context, trigger, and person context.

    This task is triggered by the following: ${trigger} based on the following context:
    taskContext: ${taskContext || 'No task context provided.'}

    ${taskTriggerDescriptions}

    You must choose an actionType from the following list:
    ${suggestedActionTypeDescriptions}

    Action Selection Guidelines:
    - If the relationship is closer, we may want to suggest a more personal action such as getting a gift, or finding & suggesting an event.
    - If the relationship is more distant, we may want to suggest a more generic action such as sending a message.
    
    For generating the context and call to action, use the following guidelines:

    Context Guidelines:
    - The context should be a single statement that explains the task in a way that is easy to understand.
    - The context should be specific to the person and the trigger.
    - If you're given a context, simply use it as is. Condense for brevity if needed.
    - If you're not given a context, you must generate one based on the trigger and the person context.

    Call to Action Guidelines:
    - The call to action should be a single statement that explains the action to take related to the actionType.
    - The call to action should be specific to actionType.
    - This should be brief like "Send a birthday message" or "Share an article as a follow up" or "Add a note to improve profile" or "Buy a birthday gift" or "Schedule a meeting to...
    - The call to action should be no more than 5 to 10 words.
    

    Example Outputs: 
    actionType: buy-gift
    context: ${person.first_name}'s birthday is coming up next week.
    callToAction: I found some gift ideas for you to consider for ${person.first_name}.

    actionType: send-message
    context: It's .
    callToAction: Here are some message ideas you can use to wish ${person.first_name} a happy birthday.

    actionType: share-content
    context: It's about time follow up with ${person.first_name}!
    callToAction: I found some content you could share with ${person.first_name}.

    actionType: schedule-meeting
    context: You requested a reminder to run an errand for ${person.first_name}!
    callToAction: I found some content you could share with ${person.first_name}.

    Relationship Notes / Context:
    ${personContext || 'No relationship context provided.'}
    `
  });

  return taskContextAndActionType;
};
