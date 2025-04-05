import type { Meta, StoryObj } from '@storybook/react';

import { ActivityChartRenderer } from './activity-chart';

const meta = {
  title: 'Network/ActivityChartRenderer',
  component: ActivityChartRenderer,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div className='w-[1000px]'>
        <Story />
      </div>
    )
  ]
} satisfies Meta<typeof ActivityChartRenderer>;

export default meta;
type Story = StoryObj<typeof ActivityChartRenderer>;

// Helper function to generate mock data
const generateMockData = (days: number, pattern: 'high' | 'low' | 'intermittent') => {
  const dates = Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const getActivityCount = (index: number, pattern: 'high' | 'low' | 'intermittent') => {
    switch (pattern) {
      case 'high':
        return Math.floor(Math.random() * 10) + 10; // 10-20 interactions
      case 'low':
        return Math.floor(Math.random() * 3); // 0-2 interactions
      case 'intermittent':
        // Create peaks every 2-3 days
        return index % 3 === 0 ? Math.floor(Math.random() * 10) + 8 : Math.floor(Math.random() * 2);
    }
  };

  const currentPeriod = dates.map((date, index) => ({
    inner5: getActivityCount(index, pattern),
    central50: getActivityCount(index, pattern),
    strategic100: getActivityCount(index, pattern),
    everyone: getActivityCount(index, pattern)
  }));

  const previousPeriod = dates.map((date, index) => ({
    inner5: getActivityCount(index, pattern),
    central50: getActivityCount(index, pattern),
    strategic100: getActivityCount(index, pattern),
    everyone: getActivityCount(index, pattern)
  }));

  return {
    currentPeriod: {
      dates,
      inner5: currentPeriod.map((d) => d.inner5),
      central50: currentPeriod.map((d) => d.central50),
      strategic100: currentPeriod.map((d) => d.strategic100),
      everyone: currentPeriod.map((d) => d.everyone)
    },
    previousPeriod: {
      dates,
      inner5: previousPeriod.map((d) => d.inner5),
      central50: previousPeriod.map((d) => d.central50),
      strategic100: previousPeriod.map((d) => d.strategic100),
      everyone: previousPeriod.map((d) => d.everyone)
    },
    totalActivities: currentPeriod.reduce(
      (sum, day) => sum + day.inner5 + day.central50 + day.strategic100 + day.everyone,
      0
    )
  };
};

// No Data Story
export const NoData: Story = {
  args: {
    data: undefined,
    isLoading: false
  }
};

// Loading Story
export const Loading: Story = {
  args: {
    data: undefined,
    isLoading: true
  }
};

// 7 Days - High Activity
export const SevenDaysHighActivity: Story = {
  args: {
    data: generateMockData(7, 'high'),
    isLoading: false
  }
};

// 7 Days - Low Activity
export const SevenDaysLowActivity: Story = {
  args: {
    data: generateMockData(7, 'low'),
    isLoading: false
  }
};

// 7 Days - Intermittent Activity
export const SevenDaysIntermittentActivity: Story = {
  args: {
    data: generateMockData(7, 'intermittent'),
    isLoading: false
  }
};

// 30 Days - High Activity
export const ThirtyDaysHighActivity: Story = {
  args: {
    data: generateMockData(30, 'high'),
    isLoading: false
  }
};

// 30 Days - Low Activity
export const ThirtyDaysLowActivity: Story = {
  args: {
    data: generateMockData(30, 'low'),
    isLoading: false
  }
};

// 30 Days - Intermittent Activity
export const ThirtyDaysIntermittentActivity: Story = {
  args: {
    data: generateMockData(30, 'intermittent'),
    isLoading: false
  }
};
