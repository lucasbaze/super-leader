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
