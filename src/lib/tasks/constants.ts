export const TASK_TRIGGERS = {
  BIRTHDAY_REMINDER: 'birthday-reminder',
  PRE_SET_REMINDER: 'pre-set-reminder',
  FOLLOW_UP: 'follow-up',
  CONTEXT_GATHER: 'context-gather',
  PRE_MEETING: 'pre-meeting',
  POST_MEETING: 'post-meeting',
  LIFE_EVENT: 'life-event',
  OPPORTUNITY: 'opportunity',
  SOCIAL_CHANGE: 'social-change',
  EXTERNAL_NEWS: 'external-news'
} as const;

export type TaskTrigger = (typeof TASK_TRIGGERS)[keyof typeof TASK_TRIGGERS];

export const SUGGESTED_ACTION_TYPES = {
  SEND_MESSAGE: 'send-message',
  SHARE_CONTENT: 'share-content',
  ADD_NOTE: 'add-note',
  BUY_GIFT: 'buy-gift'
  // MAKE_INTRO: 'make-intro',
  // PLAN_EVENT: 'plan-event',
  // SCHEDULE_MEETING: 'schedule-meeting',
  // ATTEND_EVENT: 'attend-event',
  // MAIL_LETTER: 'mail-letter'
} as const;

export type SuggestedActionType =
  (typeof SUGGESTED_ACTION_TYPES)[keyof typeof SUGGESTED_ACTION_TYPES];
