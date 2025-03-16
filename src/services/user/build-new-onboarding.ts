export const buildNewOnboardingObject = () => {
  return {
    completed: false,
    steps: {
      shareValueAsk: {
        completed: false
      }
    },
    currentStep: 'shareValueAsk'
  };
};
