import type { Meta, StoryObj } from '@storybook/react';

import { SuggestionCard } from './suggestion-card';

const meta: Meta<typeof SuggestionCard> = {
  title: 'Chat/SuggestionCard',
  component: SuggestionCard,
  parameters: {
    layout: 'centered'
  }
};

export default meta;
type Story = StoryObj<typeof SuggestionCard>;

export const Default: Story = {
  args: {
    suggestion: {
      contentUrl: 'https://example.com/article',
      title: 'Interesting Article Title',
      reason: 'This article matches their interests in technology',
      category: 'Technology',
      append: () => console.log('Append clicked')
    },
    append: () => console.log('Append clicked')
  }
};
