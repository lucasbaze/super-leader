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
      id: '1',
      user_id: 'user-1',
      person_id: 'person-1',
      topic: 'Technology',
      type: 'content',
      viewed: false,
      saved: false,
      bad: false,
      created_at: new Date().toISOString(),
      suggestion: {
        suggestedContent: {
          title: 'Interesting Article Title',
          description: 'A fascinating article about the latest technology trends',
          url: 'https://example.com/article'
        },
        messageVariants: [
          {
            tone: 'friendly',
            message: 'I found this interesting article about technology. Thought you might enjoy it!'
          },
          {
            tone: 'professional',
            message: 'This article on technology trends might be relevant to your interests.'
          },
          {
            tone: 'casual',
            message: 'Check out this cool tech article I found!'
          }
        ]
      }
    }
  }
};

export const LongTitle: Story = {
  args: {
    suggestion: {
      id: '2',
      user_id: 'user-1',
      person_id: 'person-1',
      topic: 'Technology',
      type: 'content',
      viewed: false,
      saved: false,
      bad: false,
      created_at: new Date().toISOString(),
      suggestion: {
        suggestedContent: {
          title: 'This is a very long article title that should wrap to multiple lines and test our layout',
          description: 'A detailed description of the article that provides more context about the content',
          url: 'https://example.com/article'
        },
        messageVariants: [
          {
            tone: 'friendly',
            message: 'I found this interesting article with a very long title. Thought you might enjoy it!'
          },
          {
            tone: 'professional',
            message: 'This article with an extended title might be relevant to your interests.'
          },
          {
            tone: 'casual',
            message: 'Check out this cool article I found!'
          }
        ]
      }
    }
  }
};
