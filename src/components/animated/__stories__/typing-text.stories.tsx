import type { Meta, StoryObj } from '@storybook/react';

import { TypingText } from '../typing-text';

const meta: Meta<typeof TypingText> = {
  title: 'Components/Animated/Typing Text',
  component: TypingText,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof TypingText>;

export const Default: Story = {
  args: {
    text: 'Hello, this is a typing animation!'
  }
};

export const FastTyping: Story = {
  args: {
    text: 'This text types very quickly!',
    delay: 20
  }
};

export const SlowTyping: Story = {
  args: {
    text: 'This text types very slowly...',
    delay: 100
  }
};

export const WithCustomClass: Story = {
  args: {
    text: 'This text has custom styling!',
    className: 'text-2xl font-bold text-blue-500'
  }
};

export const LongText: Story = {
  args: {
    text: 'This is a much longer text that will demonstrate how the typing animation handles multiple lines of content. It should wrap naturally and continue typing until it reaches the end of the text.'
  }
};
