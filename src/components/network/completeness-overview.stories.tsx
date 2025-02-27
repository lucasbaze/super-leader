import type { Meta, StoryObj } from '@storybook/react';

import { CompletenessOverview } from './completeness-overview';

const meta: Meta<typeof CompletenessOverview> = {
  title: 'Components/Network/CompletenessOverview',
  component: CompletenessOverview,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof CompletenessOverview>;

export const Default: Story = {
  args: {
    data: {
      inner5: 85,
      central50: 65,
      strategic100: 45,
      everyone: 25
    }
  }
};

export const AllHigh: Story = {
  args: {
    data: {
      inner5: 90,
      central50: 85,
      strategic100: 80,
      everyone: 75
    }
  }
};

export const AllMedium: Story = {
  args: {
    data: {
      inner5: 60,
      central50: 55,
      strategic100: 50,
      everyone: 45
    }
  }
};

export const AllLow: Story = {
  args: {
    data: {
      inner5: 30,
      central50: 25,
      strategic100: 20,
      everyone: 15
    }
  }
};

export const Mixed: Story = {
  args: {
    data: {
      inner5: 95,
      central50: 60,
      strategic100: 30,
      everyone: 10
    }
  }
};
