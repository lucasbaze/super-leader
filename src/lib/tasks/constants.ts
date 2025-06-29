import { stripIndents } from 'common-tags';

export const TASK_TRIGGER_SLUGS = {
  BIRTHDAY_REMINDER: 'birthday-reminder',
  USER_REQUESTED_REMINDER: 'user-requested-reminder',
  FOLLOW_UP: 'follow-up',
  CONTEXT_GATHER: 'context-gather',
  PRE_MEETING: 'pre-meeting',
  POST_MEETING: 'post-meeting',
  LIFE_EVENT: 'life-event',
  SOCIAL_CHANGE: 'social-change',
  EXTERNAL_NEWS: 'external-news'
};

export const TASK_TRIGGERS = {
  BIRTHDAY_REMINDER: {
    slug: TASK_TRIGGER_SLUGS.BIRTHDAY_REMINDER,
    description: 'The person has a birthday coming up in the near future'
  },
  USER_REQUESTED_REMINDER: {
    slug: TASK_TRIGGER_SLUGS.USER_REQUESTED_REMINDER,
    description: 'The user has requested a reminder to complete a task'
  },
  FOLLOW_UP: {
    slug: TASK_TRIGGER_SLUGS.FOLLOW_UP,
    description:
      'It is time to follow up with the person in general based on the last time the user interacted with the person'
  },
  CONTEXT_GATHER: {
    slug: TASK_TRIGGER_SLUGS.CONTEXT_GATHER,
    description: 'The user should record more information about their relationship with the person'
  },
  PRE_MEETING: {
    slug: TASK_TRIGGER_SLUGS.PRE_MEETING,
    description: 'The user has a meeting coming up with the person'
  },
  POST_MEETING: {
    slug: TASK_TRIGGER_SLUGS.POST_MEETING,
    description: 'The user has concluded a meeting with the person'
  },
  LIFE_EVENT: {
    slug: TASK_TRIGGER_SLUGS.LIFE_EVENT,
    description: 'The person has has a life event occur or is coming up that the user should know about'
  },
  // OPPORTUNITY: {
  //   slug: 'opportunity',
  //   description: 'There is an opportunity to do something with the person or for the user'
  // },
  SOCIAL_CHANGE: {
    slug: TASK_TRIGGER_SLUGS.SOCIAL_CHANGE,
    description: 'The person has had a change in a social profile that the user should know about'
  },
  EXTERNAL_NEWS: {
    slug: TASK_TRIGGER_SLUGS.EXTERNAL_NEWS,
    description: 'A person has been in the news or has had a significant event occur that the user should know about'
  }
} as const;

export type TaskTrigger = (typeof TASK_TRIGGERS)[keyof typeof TASK_TRIGGERS]['slug'];

export const taskTriggerSlugs = Object.values(TASK_TRIGGERS).map((trigger) => trigger.slug);

export const taskTriggerDescriptions = stripIndents`
  This is a list of the triggers that "trigger" the creation of a task.
  ${Object.values(TASK_TRIGGERS)
    .map((trigger) => `${trigger.slug}: ${trigger.description}`)
    .join('\n')}
`;

export const SUGGESTED_ACTION_TYPE_SLUGS = {
  SEND_MESSAGE: 'send-message',
  SHARE_CONTENT: 'share-content',
  ADD_NOTE: 'add-note',
  BUY_GIFT: 'buy-gift'
} as const;

export const SUGGESTED_ACTION_TYPES = {
  SEND_MESSAGE: {
    slug: SUGGESTED_ACTION_TYPE_SLUGS.SEND_MESSAGE,
    description: 'Send a message to the person such a text, email, or social media post'
  },
  SHARE_CONTENT: {
    slug: SUGGESTED_ACTION_TYPE_SLUGS.SHARE_CONTENT,
    description: 'Share an article, video, or other content with the person'
  },
  ADD_NOTE: {
    slug: SUGGESTED_ACTION_TYPE_SLUGS.ADD_NOTE,
    description: "Add a note to the person's profile to improve context, recall, and relationship"
  },
  BUY_GIFT: {
    slug: SUGGESTED_ACTION_TYPE_SLUGS.BUY_GIFT,
    description: 'Buy a gift for the person'
  }
  // MAKE_INTRO: 'make-intro',
  // PLAN_EVENT: 'plan-event',
  // SCHEDULE_MEETING: 'schedule-meeting',
  // ATTEND_EVENT: 'attend-event',
} as const;

export type SuggestedActionType = (typeof SUGGESTED_ACTION_TYPES)[keyof typeof SUGGESTED_ACTION_TYPES]['slug'];

export const suggestedActionTypeDescriptions = stripIndents`
  This is a list of the action types that can be taken to complete a task.
  ${Object.values(SUGGESTED_ACTION_TYPES)
    .map((action) => `${action.slug}: ${action.description}`)
    .join('\n')}
`;
export const suggestedActionTypeSlugs = Object.values(SUGGESTED_ACTION_TYPES).map((action) => action.slug);
