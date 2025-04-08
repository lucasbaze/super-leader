import type { Meta, StoryObj } from '@storybook/react';

import { ActivityTimeline } from './activity-timeline';

const meta: Meta<typeof ActivityTimeline> = {
  title: 'Person/ActivityTimeline',
  component: ActivityTimeline,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ActivityTimeline>;

// Sample interactions for different scenarios
const shortNoteInteraction = {
  id: '1',
  type: 'note',
  note: 'This is a short note about the interaction.',
  created_at: new Date().toISOString(),
  person_id: 'person-1',
  user_id: 'user-1'
};

const longNoteInteraction = {
  id: '2',
  type: 'note',
  note: `This is a much longer note that should trigger the expand/collapse functionality. 
  It contains multiple paragraphs and detailed information about the interaction.
  
  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, 
  nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, 
  nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.
  
  Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl. 
  Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget aliquam nisl nisl eget nisl.`,
  created_at: new Date().toISOString(),
  person_id: 'person-1',
  user_id: 'user-1'
};

const emailInteraction = {
  id: '3',
  type: 'email',
  note: 'Sent a follow-up email regarding the project timeline.',
  created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  person_id: 'person-1',
  user_id: 'user-1'
};

const meetingInteraction = {
  id: '4',
  type: 'meeting',
  note: 'Scheduled a team meeting for next week.',
  created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  person_id: 'person-1',
  user_id: 'user-1'
};

const reminderInteraction = {
  id: '5',
  type: 'reminder',
  note: 'Set a reminder to follow up on the proposal.',
  created_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
  person_id: 'person-1',
  user_id: 'user-1'
};

const giftInteraction = {
  id: '6',
  type: 'gift',
  note: 'Sent a thank you gift for their contribution.',
  created_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
  person_id: 'person-1',
  user_id: 'user-1'
};

const textMessageInteraction = {
  id: '7',
  type: 'text message',
  note: 'Sent a text message confirming the appointment.',
  created_at: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
  person_id: 'person-1',
  user_id: 'user-1'
};

const invitationInteraction = {
  id: '8',
  type: 'invitation',
  note: 'Sent an invitation to the upcoming event.',
  created_at: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
  person_id: 'person-1',
  user_id: 'user-1'
};

// Empty timeline
export const Empty: Story = {
  args: {
    interactions: []
  }
};

// Single interaction with short note
export const SingleShortNote: Story = {
  args: {
    interactions: [shortNoteInteraction]
  }
};

// Single interaction with long note (expandable)
export const SingleLongNote: Story = {
  args: {
    interactions: [longNoteInteraction]
  }
};

// Multiple interactions with different types
export const MultipleInteractions: Story = {
  args: {
    interactions: [
      shortNoteInteraction,
      emailInteraction,
      meetingInteraction,
      reminderInteraction,
      giftInteraction,
      textMessageInteraction,
      invitationInteraction
    ]
  }
};

// Multiple interactions with some long notes
export const MixedInteractions: Story = {
  args: {
    interactions: [
      shortNoteInteraction,
      longNoteInteraction,
      emailInteraction,
      meetingInteraction,
      longNoteInteraction,
      reminderInteraction,
      giftInteraction
    ]
  }
};
