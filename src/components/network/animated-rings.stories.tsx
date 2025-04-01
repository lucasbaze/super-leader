import type { Meta, StoryObj } from '@storybook/react';

import { AnimatedRings } from './animated-rings';

const meta: Meta<typeof AnimatedRings> = {
  title: 'Network/AnimatedRings',
  component: AnimatedRings,
  parameters: {
    layout: 'centered'
  },
  args: {
    inner5Score: 50,
    central50Score: 30,
    strategic100Score: 20
  },
  argTypes: {
    inner5Score: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Completeness score for Inner 5'
    },
    central50Score: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Completeness score for Central 50'
    },
    strategic100Score: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Completeness score for Strategic 100'
    }
  }
};

export default meta;
type Story = StoryObj<typeof AnimatedRings>;

export const Default: Story = {};

export const AllComplete: Story = {
  args: {
    inner5Score: 100,
    central50Score: 100,
    strategic100Score: 100
  }
};

export const LowScores: Story = {
  args: {
    inner5Score: 10,
    central50Score: 5,
    strategic100Score: 2
  }
};

export const MixedScores: Story = {
  args: {
    inner5Score: 80,
    central50Score: 45,
    strategic100Score: 15
  }
};
