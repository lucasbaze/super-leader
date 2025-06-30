import { ActionAdapter } from '../types';

export const SUGGESTED_ACTION_TYPE_SLUGS = {
  SEND_MESSAGE: 'send-message',
  SHARE_CONTENT: 'share-content',
  ADD_NOTE: 'add-note',
  BUY_GIFT: 'buy-gift'
} as const;

export const sendMessageActionAdapter: ActionAdapter = {
  slug: SUGGESTED_ACTION_TYPE_SLUGS.SEND_MESSAGE,
  description:
    'Suggest to send a simple text based message to the person such as text or an email. This is be a short message that is not too long or too short.',
  whenToUse:
    'When the relationship or context suggests that a simple touch point is appropriate. Such as asking how they are doing, asking about how a previous trip went, etc...',
  expectedContextToGenerateOutput:
    'Provide the personId of the person to send the message to and the context of why the user should send the message. Do not generate the message, simply the relevant context and why the user should send the message.',
  tags: ['send-message', 'text', 'email', 'simple', 'basic', 'short']
};

export const sendContentActionAdapter: ActionAdapter = {
  slug: SUGGESTED_ACTION_TYPE_SLUGS.SHARE_CONTENT,
  description: 'Suggest the user to share content with the person such as an article, video, or other content.',
  whenToUse:
    'This is a great option for a generic follow up that does not have a clear trigger or reason to follow up. Alternatively, if there is relevant news that included in the inputs that could be shared with the person based on their interests or goals, we can share that.',
  expectedContextToGenerateOutput:
    "Provide the personId of the person to share the content with and the context of why the user should share the content. Do not generate the content unless it was already provided in the inputs. Simply include the relevant context, the type of content that could be shared based on the person's interests or goals, and why the user should share the content.",
  tags: ['share-content', 'article', 'video', 'content', 'short']
};

export const addNoteActionAdapter: ActionAdapter = {
  slug: SUGGESTED_ACTION_TYPE_SLUGS.ADD_NOTE,
  description:
    "Suggest the user to add a note to the person's profile to improve context, recall, and the profile completeness of the relationship.",
  whenToUse:
    'This should be used when the person\'s profile completeness can be improved. Anyone in the 5, 50, or 100 groups should have at least 80 - 90% profile completeness. This is also great to use as a possible "pre-follow up" to get more information about the person. For instance if the user snoozes a follow up, or does not need to follow up today, we can use the "add note" as a mental trigger for the user to follow up with the person or ask a meaningful question.',
  expectedContextToGenerateOutput:
    'Provide the personId of the person to add the note to, the specific question or information the user should note down, and why it is important to note down. Do not assume you know the answer or what to note down, simply ask the user to note down the information. You can provide example answers if you think it will help the user.',
  tags: ['context', 'crm-maintenance', 'data-hygeine', 'relatoinshiorelation']
};

export const buyGiftActionAdapter: ActionAdapter = {
  slug: SUGGESTED_ACTION_TYPE_SLUGS.BUY_GIFT,
  description: 'Suggest the user to buy a gift for the person.',
  whenToUse: 'This should be used when the person has a birthday or anniversary coming up.',
  expectedContextToGenerateOutput:
    'Simply provide the personId of the person to buy the gift for. Do not generate the gift, simply the relevant context and why the user should buy the gift. If the person is in the 5, 50, or 100 groups, it is more important to try to buy a gift if the nature of the relationship is more intimate or personal. If the person is in the other groups, it is less important to buy a gift.',
  tags: ['birthday', 'anniversary', 'relationship-building', 'relationship-deepening']
};
