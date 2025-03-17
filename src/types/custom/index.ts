// TODO: Move to service types
import { Group } from '../database';

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
