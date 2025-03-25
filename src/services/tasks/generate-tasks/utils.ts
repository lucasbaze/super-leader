import { stripIndent } from 'common-tags';
import { z } from 'zod';

import { SUGGESTED_ACTION_TYPES, SuggestedActionType } from '@/lib/tasks/constants';
import { Person } from '@/types/database';
import { generateObject } from '@/vendors/ai';

import {
  SendMessageAction,
  sendMessageActionSchema,
  TaskContext,
  taskContextSchema
} from '../types';

export const generateTaskContext = async (
  person: Person,
  birthdayDate: string
): Promise<TaskContext & { actionType: SuggestedActionType }> => {
  const taskContext = await generateObject({
    schema: taskContextSchema.extend({
      actionType: z
        .enum(Object.values(SUGGESTED_ACTION_TYPES) as [string, ...string[]])
        .describe('The type of action to suggest')
    }),
    prompt: stripIndent`Based on the context of the person, determine the type of suggested action to take for ${person.first_name}'s birthday.

    actionType: This will be one of the following: ${Object.values(SUGGESTED_ACTION_TYPES).join(', ')} depending on the type of relationship between the person and the user.

    If the relationship is closer, we may want to suggest a more personal action such as getting a gift, or finding & suggesting an event.
    
    If the relationship is more distant, we may want to suggest a more generic action such as sending a message.
    
    Context: This will simply be something like ${person.first_name}'s birthday is coming up on ${birthdayDate}.

    Call to Action: This will be a brief sentence or two that explains the action to take related to the actionType.

    Examples: 
    actionType: buy-gift
    context: ${person.first_name}'s birthday is coming up on ${birthdayDate}.
    callToAction: I found some gift ideas for you to consider for ${person.first_name}.

    actionType: send-message
    context: It's ${person.first_name}'s birthday on ${birthdayDate}.
    callToAction: Here are some message ideas you can use to wish ${person.first_name} a happy birthday.

    actionType: share-content
    context: It's time to celebrate ${person.first_name}'s birthday on ${birthdayDate}!
    callToAction: I found some content that could be fun to share with ${person.first_name} on their birthday.

    Relationship Notes / Context:
    Assume we're not close and just need to send a generic message.
    `
  });

  return taskContext;
};

export const generateSendMessageSuggestedAction = async (
  taskContext: TaskContext
): Promise<SendMessageAction> => {
  const suggestedAction = await generateObject({
    schema: sendMessageActionSchema,
    prompt: stripIndent`
      Generate the suggested content and message variants based on the context.
      
      Create at least 4 message variants with different tones and styles. Include a mix of casual, formal, and friendly tones. Include at least one ridiculous or funny message such as a poem, joke, or something generally lighthearted.

      Context: ${JSON.stringify(taskContext, null, 2)}
    `
  });

  return suggestedAction;
};
