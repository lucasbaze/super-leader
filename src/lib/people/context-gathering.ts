export const CONTEXT_GATHERING_TYPES = {
  PERSONAL: 'personal',
  PROFESSIONAL: 'professional',
  GOALS: 'goals',
  VALUES: 'values',
  STRENGTHS: 'strengths',
  CHALLENGES: 'challenges',
  ECOSYSTEMS: 'ecosystems'
} as const;

export type ContextGatheringType =
  (typeof CONTEXT_GATHERING_TYPES)[keyof typeof CONTEXT_GATHERING_TYPES];
