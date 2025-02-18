import { Gift, History, UserCog } from '@/components/icons';

import { TASK_TYPES } from './task-types';

export const TASK_METADATA = {
  [TASK_TYPES.BIRTHDAY_REMINDER]: {
    icon: Gift,
    accentColor: 'bg-orange-500'
  },
  [TASK_TYPES.SUGGESTED_REMINDER]: {
    icon: History,
    accentColor: 'bg-orange-500'
  },
  [TASK_TYPES.PROFILE_UPDATE]: {
    icon: UserCog,
    accentColor: 'bg-purple-500'
  }
} as const;
