import { CONTEXT_GATHERING_TYPES } from '@/lib/people/context-gathering';

export const onboardingStepsQuestionsAndCriteria = {
  [CONTEXT_GATHERING_TYPES.PERSONAL]: {
    generalOrder: 1,
    label: 'Personal',
    conversationalQuestions: [
      'Can you tell me a little about yourself? Such as your name, where you live, and your family situation such as children, partner, pets, etc.'
    ],
    directQuestions: [
      'What is your name?',
      'What city and state do you currently live in?',
      'Do you have a family and children?'
    ],
    sufficientCriteria: `User clearly states their city/state and provides basic family information (e.g., "I live in Seattle, WA, with my partner and two kids.")`
  },
  [CONTEXT_GATHERING_TYPES.PROFESSIONAL]: {
    generalOrder: 2,
    label: 'Professional',
    conversationalQuestions: [
      'Can you tell me a little about your professional background? Such as your industry, current role, and how you got into your current role.'
    ],
    directQuestions: [
      'What is your industry?',
      'What is your current role?',
      'How much time do you currently spend engaging with your network?',
      'How do you currently engage with your network?'
    ],
    sufficientCriteria: `User identifies their current role and briefly explains their path or motivation (e.g., "I'm a real estate broker, and I started because I've always loved connecting people with homes.", "I'm a software engineer, and I started because I'm passionate about building products that help people connect with each other.", "I'm a Venture Capitalist, and I started because I'm passionate about space exploration.", "I'm an entrepreneur, and I started because I'm passionate about solving cervical cancer.")`
  },
  [CONTEXT_GATHERING_TYPES.GOALS]: {
    generalOrder: 4,
    label: 'Goals',
    conversationalQuestions: [
      "What personal and professional goals do you have over the next 5 years? If you're not sure, what skills do you want to develop over the next 5 years?"
    ],
    directQuestions: [
      'Where do you want to be in your career in the next 5 years?',
      'What skills do you want to develop over the next 5 years?',
      'Where are you along the path to your goals?',
      'What level of confidence do you have in your ability to achieve your goals?'
    ],
    sufficientCriteria: `User identifies their career goals and skills goals (e.g., "I want to be a real estate broker, and I want to develop my skills in negotiation and communication.")`
  },
  [CONTEXT_GATHERING_TYPES.VALUES]: {
    generalOrder: 3,
    label: 'Values',
    conversationalQuestions: [
      'What do you believe that leads you to the goals you have?',
      'What do you believe the worlds needs more of today?'
    ],
    directQuestions: [
      'What is important to you in your life?',
      'Who are your role models or people you look up to?',
      'If you could have dinner with anyone in the world, who would it be?',
      'What core values do you feel as though you live by?'
    ],
    sufficientCriteria: `User explicitly mentions at least one core value or role model that influences their life or decisions (e.g., "Integrity is central to me, and I admire leaders like Oprah Winfrey.")`
  },
  [CONTEXT_GATHERING_TYPES.STRENGTHS]: {
    generalOrder: 5,
    label: 'Strengths',
    conversationalQuestions: ['What skills (both hard and soft) do you feel like you excel at?'],
    directQuestions: [
      'What are you most proud of?',
      'What activities do you find most rewarding?',
      'What do you think you do better than others?'
    ],
    sufficientCriteria: `User highlights at least one clear strength or achievement (e.g., "I'm really good at organizing events and I'm proud of the community workshops I've led.", "I'm really good at fundraising and I'm proud of the non-profit I've started.", "I'm really good at building excel models and 3D models, and I recently built a 3D printed lamp for a friend's birthday.")`
  },
  [CONTEXT_GATHERING_TYPES.CHALLENGES]: {
    generalOrder: 6,
    label: 'Challenges',
    conversationalQuestions: ['What challenges do you face in your life or work?'],
    directQuestions: [
      'What are you struggling with right now?',
      'Is there anything you wish you could change about your life or work?'
    ],
    sufficientCriteria: `User identifies at least one challenge they're facing (e.g., "I'm struggling to find time to network.", "I'm trying to figure out how to get more clients.", "I'm trying to fundraise for my non-profit.", "I'm trying to meet folks in a new city, and I do not know anyone in this city." )`
  },
  [CONTEXT_GATHERING_TYPES.ECOSYSTEMS]: {
    generalOrder: 7,
    label: 'Ecosystems',
    conversationalQuestions: [
      'Where do you spend your time outside of work? Such as hobbies, organizations, volunteering or groups? Feel free to share all of them.'
    ],
    directQuestions: [
      'What activities or groups are you involved in?',
      'What groups or organization are you a part of?'
    ],
    sufficientCriteria: `User mentions at least one hobby or group they're actively involved in (e.g., "I enjoy dancing and am part of a local yoga community.", "I'm a member of the local chapter of the Sierra Club.", "I attend my local Toastmasters club, and church on Sundays.")`
  }
};

export const getOnboardingStep = (step: keyof typeof onboardingStepsQuestionsAndCriteria) => {
  return onboardingStepsQuestionsAndCriteria[step];
};

export const ONBOARDING_STEPS = Object.keys(onboardingStepsQuestionsAndCriteria);
