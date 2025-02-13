import type { Meta, StoryObj } from '@storybook/react';

import { SuggestionCard } from './suggestion-card';

const meta: Meta<typeof SuggestionCard> = {
  title: 'Chat/SuggestionCard',
  component: SuggestionCard,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    onBookmark: { action: 'bookmarked' },
    onDislike: { action: 'disliked' },
    onViewed: { action: 'viewed' }
  }
};

export default meta;
type Story = StoryObj<typeof SuggestionCard>;

export const Default: Story = {
  args: {
    suggestion: {
      id: '1',
      contentUrl: 'https://example.com/article',
      title: 'Interesting Article Title',
      reason: 'This article matches their interests in technology'
    },
    append: () => console.log('Append clicked'),
    onBookmark: () => console.log('Bookmarked'),
    onDislike: () => console.log('Disliked'),
    onViewed: () => console.log('Viewed')
  }
};

export const LongTitle: Story = {
  args: {
    suggestion: {
      id: '2',
      contentUrl: 'https://example.com/article',
      title:
        'This is a very long article title that should wrap to multiple lines and test our layout',
      reason: 'This article has a particularly long title to test wrapping behavior'
    },
    append: () => console.log('Append clicked'),
    onBookmark: () => console.log('Bookmarked'),
    onDislike: () => console.log('Disliked'),
    onViewed: () => console.log('Viewed')
  }
};
