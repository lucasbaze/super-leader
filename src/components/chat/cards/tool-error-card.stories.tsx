import type { Meta, StoryObj } from '@storybook/react';

import { ToolErrorCard } from './tool-error-card';

const meta = {
  title: 'Chat/Cards/ToolErrorCard',
  component: ToolErrorCard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'The user-friendly error message'
    },
    errorDetails: {
      control: 'text',
      description: 'The technical error details'
    }
  }
} satisfies Meta<typeof ToolErrorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: `I encountered an issue while trying to fetch content suggestions. Let me know if you'd like to try again.`,
    errorDetails: 'Error: Failed to fetch suggestions: Network request failed',
    toolName: 'getPersonSuggestions'
  }
};

export const DatabaseError: Story = {
  args: {
    message: `I encountered an issue while trying to save your data. Let me know if you'd like to try again.`,
    errorDetails: 'Error: Database connection failed: time zone "gmt-0600" not recognized',
    toolName: 'createPerson'
  }
};
