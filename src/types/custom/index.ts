import { ContentVariant } from '@/services/suggestions/types';
import { SinglePersonSummary } from '@/services/summary/schemas';

import { Group, Person as PersonDB, Suggestion as SuggestionDB } from '../database';

export type PersonGroup = Pick<Group, 'id' | 'name' | 'slug' | 'icon'>;

export type OnboardingStep = {
  completed: boolean;
};

export type OnboardingSteps = {
  [key: string]: OnboardingStep;
};

export type Onboarding = {
  completed: boolean;
  steps: OnboardingSteps;
  currentStep: string;
};

export type Person = PersonDB & {
  ai_summary: SinglePersonSummary;
};

export type Suggestion = SuggestionDB & {
  suggestion: ContentVariant;
};

// https://developer.unipile.com/docs/account-lifecycle
export const authStatuses = [
  'OK',
  'CREDENTIALS',
  'ERROR',
  'STOPPED',
  'CONNECTING',
  'DELETED',
  'CREATION_SUCCESS',
  'RECONNECTED',
  'SYNC_SUCCESS'
] as const;
export type AuthStatus = (typeof authStatuses)[number];

export const accountStatuses = ['ACTIVE', 'INACTIVE'] as const;
export type AccountStatus = (typeof accountStatuses)[number];

export const accountNames = {
  LINKEDIN: 'LINKEDIN'
} as const;
export type AccountName = (typeof accountNames)[keyof typeof accountNames];
