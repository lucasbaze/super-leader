export const TASK_TYPES = {
  BIRTHDAY_REMINDER: 'birthday-reminder',
  REQUESTED_REMINDER: 'requested-reminder',
  SUGGESTED_REMINDER: 'suggested-reminder',
  PROFILE_UPDATE: 'profile-update'
} as const;

export type TaskType = (typeof TASK_TYPES)[keyof typeof TASK_TYPES];
