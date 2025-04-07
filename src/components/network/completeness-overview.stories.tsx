import type { Meta, StoryObj } from '@storybook/react';

import { CompletenessOverview } from './completeness-overview';

const meta: Meta<typeof CompletenessOverview> = {
  title: 'Network/CompletenessOverview',
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
      inner5: {
        completeness_score: 85,
        count: 5
      },
      central50: {
        completeness_score: 65,
        count: 32
      },
      strategic100: {
        completeness_score: 45,
        count: 78
      },
      everyone: {
        completeness_score: 25,
        count: 143
      }
    }
  }
};

export const AllHigh: Story = {
  args: {
    data: {
      inner5: {
        completeness_score: 90,
        count: 5
      },
      central50: {
        completeness_score: 85,
        count: 32
      },
      strategic100: {
        completeness_score: 80,
        count: 78
      },
      everyone: {
        completeness_score: 75,
        count: 143
      }
    }
  }
};

export const AllMedium: Story = {
  args: {
    data: {
      inner5: {
        completeness_score: 60,
        count: 5
      },
      central50: {
        completeness_score: 55,
        count: 32
      },
      strategic100: {
        completeness_score: 50,
        count: 78
      },
      everyone: {
        completeness_score: 45,
        count: 143
      }
    }
  }
};

export const AllLow: Story = {
  args: {
    data: {
      inner5: {
        completeness_score: 30,
        count: 5
      },
      central50: {
        completeness_score: 25,
        count: 32
      },
      strategic100: {
        completeness_score: 20,
        count: 78
      },
      everyone: {
        completeness_score: 15,
        count: 143
      }
    }
  }
};

export const Mixed: Story = {
  args: {
    data: {
      inner5: {
        completeness_score: 95,
        count: 5
      },
      central50: {
        completeness_score: 60,
        count: 32
      },
      strategic100: {
        completeness_score: 30,
        count: 78
      },
      everyone: {
        completeness_score: 10,
        count: 143
      }
    }
  }
};
