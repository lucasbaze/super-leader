import type { Meta, StoryObj } from '@storybook/react';

import { ProfileCompleteness } from './profile-completeness';

const meta: Meta<typeof ProfileCompleteness> = {
  title: 'Person/ProfileCompleteness',
  component: ProfileCompleteness,
  parameters: {
    layout: 'centered'
  }
};

export default meta;
type Story = StoryObj<typeof ProfileCompleteness>;

export const Default: Story = {
  args: {
    value: 20,
    questions: [
      "What is Darian's current job or career focus?",
      'What specific skills or expertise does Darian have?',
      'Has Darian achieved any notable professional accomplishments?',
      "What are Darian's long-term goals or aspirations?"
    ]
  }
};
