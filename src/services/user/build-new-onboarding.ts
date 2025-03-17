import { ONBOARDING_STEPS } from '@/lib/onboarding/onboarding-steps';
import { OnboardingStep } from '@/types/custom';

export const buildNewOnboardingObject = () => {
  return {
    completed: false,
    steps: {
      ...ONBOARDING_STEPS.reduce(
        (acc, step) => {
          acc[step] = {
            completed: false
          };
          return acc;
        },
        {} as Record<string, OnboardingStep>
      ),
      shareValueAsk: {
        completed: false
      }
    },
    currentStep: ONBOARDING_STEPS[0]
  };
};
