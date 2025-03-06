import type { Meta, StoryObj } from '@storybook/react';

import { ContextMessageCard } from './context-message-card';

const meta: Meta<typeof ContextMessageCard> = {
  title: 'Chat/Cards/ContextMessageCard',
  component: ContextMessageCard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    initialQuestion: {
      control: 'text',
      description: 'The initial question to ask the user'
    },
    followUpQuestions: {
      description: 'Follow-up questions to ask after the initial question'
    },
    priority: {
      control: 'text',
      description: 'The priority level of the question'
    },
    reasoning: {
      control: 'text',
      description: 'The reasoning behind asking this question'
    }
  }
};

export default meta;
type Story = StoryObj<typeof ContextMessageCard>;

export const Default: Story = {
  args: {
    initialQuestion: 'What are your main goals for the next quarter?',
    followUpQuestions: [
      'How do these goals align with your long-term vision?',
      'What resources do you need to achieve these goals?',
      'What obstacles do you anticipate?'
    ],
    priority: 1,
    reasoning:
      'Understanding your quarterly goals helps me provide more relevant suggestions and track progress over time. This information will be used to personalize your experience and provide targeted recommendations.'
  }
};

export const WithLongReasoning: Story = {
  args: {
    initialQuestion: 'Could you tell me about your communication preferences with your team?',
    followUpQuestions: [
      'How often do you prefer to have team meetings?',
      'What communication tools do you use most frequently?'
    ],
    priority: 2,
    reasoning:
      "Understanding your communication preferences helps me suggest appropriate collaboration tools and meeting schedules. This information is particularly important because your profile indicates you manage a distributed team across multiple time zones. By knowing how you prefer to communicate, I can help optimize your team's workflow and suggest more effective collaboration strategies. Additionally, this will help me format information in ways that align with your preferred communication style."
  }
};

export const WithMarkdownContent: Story = {
  args: {
    initialQuestion: 'What are your top 3 priorities for the **upcoming project launch**?',
    followUpQuestions: [
      'Who are the key stakeholders involved?',
      'What metrics will you use to measure success?'
    ],
    priority: 1,
    reasoning:
      'Project launches are critical moments that require clear prioritization. Understanding your top priorities helps me:\n\n1. Focus on the most important aspects\n2. Identify potential resource constraints\n3. Suggest appropriate tracking mechanisms'
  }
};

export const WithPersonalQuestion: Story = {
  args: {
    initialQuestion: 'How would you describe your leadership style?',
    followUpQuestions: [
      'How has your leadership style evolved over time?',
      'In what situations do you adapt your approach?'
    ],
    priority: 3,
    reasoning:
      'Understanding your leadership style helps me provide more personalized suggestions for team management and communication. This information will be used to tailor recommendations to your specific approach.'
  }
};
