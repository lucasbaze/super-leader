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
export const INTEGRATION_AUTH_STATUS = {
  OK: 'OK',
  CREDENTIALS: 'CREDENTIALS',
  ERROR: 'ERROR',
  STOPPED: 'STOPPED',
  CONNECTING: 'CONNECTING',
  DELETED: 'DELETED',
  CREATION_SUCCESS: 'CREATION_SUCCESS',
  RECONNECTED: 'RECONNECTED',
  SYNC_SUCCESS: 'SYNC_SUCCESS'
} as const;
export type AuthStatus = (typeof INTEGRATION_AUTH_STATUS)[keyof typeof INTEGRATION_AUTH_STATUS];

export const INTEGRATION_ACCOUNT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const;
export type AccountStatus = (typeof INTEGRATION_ACCOUNT_STATUS)[keyof typeof INTEGRATION_ACCOUNT_STATUS];

// TODO: Update name to INTEGRATION_ACCOUNT_NAME
export const INTEGRATION_ACCOUNT_NAME = {
  LINKEDIN: 'LINKEDIN'
  // GOOGLE: 'GOOGLE'
} as const;
export type AccountName = (typeof INTEGRATION_ACCOUNT_NAME)[keyof typeof INTEGRATION_ACCOUNT_NAME];
