import type { Meta, StoryObj } from '@storybook/react';

import {
  Bell,
  Cake,
  Calendar,
  Gift,
  History,
  LineChart,
  Mail,
  MessageSquare,
  Phone,
  Share2,
  UserCog,
  Users
} from '@/components/icons';
import { TASK_TYPES } from '@/lib/tasks/task-types';

import { TaskSuggestionCard } from './task-suggestion-card';

const meta: Meta<typeof TaskSuggestionCard> = {
  title: 'Components/Home/TaskSuggestionCard',
  component: TaskSuggestionCard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof TaskSuggestionCard>;

const mockData = [
  {
    type: 'call',
    person: { id: '1', name: 'John Doe', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Schedule a call',
    context: 'Discuss project proposal for Q3',
    suggestion:
      "Hi John, I'd like to schedule a call to discuss the project proposal you mentioned last week. Are you available this Thursday at 2 PM?",
    icon: <Phone className='size-4' />,
    date: 'Today',
    accentColor: 'bg-purple-500'
  },
  {
    type: 'event',
    person: { id: '2', name: 'Sarah Smith', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Attend Zoom meeting',
    context: 'Weekly team sync at 3 PM',
    suggestion: 'Prepare update on milestone 2 progress and resource allocation challenges.',
    icon: <Calendar className='size-4' />,
    date: 'Today',
    accentColor: 'bg-green-500'
  },
  {
    type: 'email',
    person: { id: '3', name: 'Mark Johnson', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Reply to email',
    context: 'Re: Partnership opportunity',
    suggestion:
      "Thank you for reaching out about the partnership opportunity. I'm excited about the potential synergies between our companies. Could we schedule a call next week to discuss further?",
    icon: <Mail className='size-4' />,
    date: 'Tomorrow',
    accentColor: 'bg-blue-500'
  },
  {
    type: 'introduction',
    person: { id: '4', name: 'Alex Brown', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Introduce to Emily',
    context: 'Potential collaboration on UX project',
    suggestion:
      "Hi Emily, I'd like to introduce you to Alex. Alex is a talented UX designer specializing in fintech, and I thought you two might have some interesting synergies for your startup's design needs.",
    icon: <Users className='size-4' />,
    date: 'This Week',
    accentColor: 'bg-indigo-500'
  },
  {
    type: 'birthday',
    person: { id: '5', name: 'Lisa Chen', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Send birthday wishes',
    context: 'Birthday tomorrow - Key contact in tech industry',
    suggestion:
      'Happy early birthday Lisa! 🎉 I remember our discussion about AI in healthcare last month. Would love to catch up over coffee next week and hear about the developments in your research.',
    icon: <Cake className='size-4' />,
    date: 'Tomorrow',
    accentColor: 'bg-pink-500'
  },
  {
    type: 'profile-update',
    person: { id: '6', name: 'David Kim', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Update contact details',
    context: 'Missing key information for potential investor',
    suggestion:
      "Add David's investment preferences, portfolio focus, and preferred deal size to better match future opportunities. Recent interaction suggests interest in AI startups.",
    icon: <UserCog className='size-4' />,
    date: 'This Week',
    accentColor: 'bg-orange-500'
  },
  {
    type: 'content-share',
    person: { id: '7', name: 'Rachel Green', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Share relevant article',
    context: 'Aligns with her recent startup pivot',
    suggestion:
      "Hey Rachel, just read this great article on 'Sustainable Business Models in Tech' that reminded me of our last conversation about your company's direction. Thought you might find it interesting: [Article Link]",
    icon: <Share2 className='size-4' />,
    date: 'This Week',
    accentColor: 'bg-blue-400'
  },
  {
    type: 'networking-event',
    person: {
      id: '8',
      name: 'Tech Founders Meetup',
      avatar: '/placeholder.svg?height=40&width=40'
    },
    action: 'Consider attending event',
    context: 'Aligns with your goal: "Expand tech network"',
    suggestion:
      'Tech Founders Meetup next Tuesday, 6 PM. 3 people from your network (including Sarah Smith) are attending. Great opportunity to expand your tech network for your startup goals.',
    icon: <Users className='size-4' />,
    date: 'Next Week',
    accentColor: 'bg-violet-500'
  },
  {
    type: 'social-engagement',
    person: { id: '9', name: 'Mike Ross', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Engage with recent post',
    context: 'Posted about successful funding round',
    suggestion:
      "Congratulate Mike on his startup's Series A funding announcement. Consider mentioning your shared experience in the fintech space and suggest catching up.",
    icon: <MessageSquare className='size-4' />,
    date: 'Today',
    accentColor: 'bg-cyan-500'
  },
  {
    type: 'reconnect',
    person: { id: '10', name: 'Emma Wilson', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Reconnect after 3 months',
    context: 'Key contact in target industry',
    suggestion:
      "Hi Emma, it's been a while since our last chat about industry trends. I've been working on some interesting projects in the space you mentioned. Would love to catch up and share insights.",
    icon: <History className='size-4' />,
    date: 'This Week',
    accentColor: 'bg-teal-500'
  },
  {
    type: 'network-insight',
    person: { id: '11', name: 'Network Growth', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Expand healthcare contacts',
    context: 'Gap identified in network composition',
    suggestion:
      "Your network analysis shows limited connections in healthcare tech. Consider reaching out to John's contacts in the space or attending the upcoming Healthcare Innovation Summit.",
    icon: <LineChart className='size-4' />,
    date: 'This Month',
    accentColor: 'bg-rose-500'
  },
  {
    type: 'follow-up-reminder',
    person: { id: '12', name: 'James Miller', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Follow up on introduction',
    context: 'Introduced by Sarah Smith last week',
    suggestion:
      "Hi James, hope you're well! Following up on Sarah's introduction last week. I'd love to learn more about your experience scaling tech teams and share some insights from my recent projects.",
    icon: <Bell className='size-4' />,
    date: 'Tomorrow',
    accentColor: 'bg-amber-500'
  },
  {
    type: 'hard-reminder',
    person: { id: '13', name: 'Frank Smith', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Follow up on wedding invitation',
    context: 'Need to RSVP for his wedding by tomorrow',
    suggestion:
      "Have you RSVP'd for the wedding? This could be a great opportunity to meet some new people and expand your network.",
    icon: <Bell className='size-4' />,
    date: 'Today',
    accentColor: 'bg-amber-500'
  },
  {
    type: 'suggested-reminder',
    person: { id: '13', name: 'Bob Warren', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Send Bob a gift for his grandkids',
    context: 'He mentioned his grandkids need Bitcoin related gifts',
    suggestion:
      "Here are some gift ideas for Bob's grandkids from the Tuttle Twins. I thought you might like to know:",
    icon: <Gift className='size-4' />,
    date: 'Today',
    accentColor: 'bg-amber-500'
  },
  {
    type: 'suggested-reminder',
    person: { id: '14', name: 'John Doe', avatar: '/placeholder.svg?height=40&width=40' },
    action: 'Ask John about this recent trip',
    context: 'He mentioned going to Europe a few weeks ago',
    suggestion:
      "John, How was your trip to Europe? I've been meaning to catch up and hear about your adventures. Got any photos to share?",
    icon: <MessageSquare className='size-4' />,
    date: 'Today',
    accentColor: 'bg-teal-500'
  }
];

// export const Introduction: Story = {
//   args: {
//     action: mockData[3]
//   }
// };

export const Birthday: Story = {
  args: {
    // @ts-expect-error - This is a mock
    task: {
      id: '1',
      type: TASK_TYPES.BIRTHDAY_REMINDER,
      content: {
        action: 'Send birthday wishes',
        context: "John's birthday is coming up!",
        suggestion:
          "Don't forget to wish John a happy birthday! Consider sending a thoughtful message or gift."
      },
      end_at: new Date().toISOString(),
      person: {
        id: '1',
        first_name: 'John',
        last_name: 'Doe'
      }
    }
  }
};

// export const Call: Story = {
//   args: {
//     action: mockData[0]
//   }
// };

// export const ZoomMeeting: Story = {
//   args: {
//     action: mockData[1]
//   }
// };

// export const EmailReply: Story = {
//   args: {
//     action: mockData[2]
//   }
// };

export const ProfileUpdate: Story = {
  args: {
    // @ts-expect-error - This is a mock
    task: {
      id: '2',
      type: TASK_TYPES.PROFILE_UPDATE,
      content: {
        action: 'Update profile information',
        context: 'Missing key information',
        suggestion: 'Add current role and company information to better maintain the relationship.'
      },
      end_at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      person: {
        id: '2',
        first_name: 'Jane',
        last_name: 'Smith'
      }
    }
  }
};

// export const ContentShare: Story = {
//   args: {
//     action: mockData[6]
//   }
// };

// export const NetworkingEvent: Story = {
//   args: {
//     action: mockData[7]
//   }
// };

// export const SocialEngagement: Story = {
//   args: {
//     action: mockData[8]
//   }
// };

// export const Reconnect: Story = {
//   args: {
//     action: mockData[9]
//   }
// };

// export const NetworkInsight: Story = {
//   args: {
//     action: mockData[10]
//   }
// };

// export const FollowUpReminder: Story = {
//   args: {
//     action: mockData[11]
//   }
// };

// export const HardReminder: Story = {
//   args: {
//     action: mockData[12]
//   }
// };

export const SuggestedReminder: Story = {
  args: {
    // @ts-expect-error - This is a mock
    task: {
      id: '3',
      type: TASK_TYPES.SUGGESTED_REMINDER,
      content: {
        action: 'Follow up on meeting',
        context: 'Recent discussion follow-up',
        suggestion: 'Schedule a follow-up meeting to discuss project progress.'
      },
      end_at: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
      person: {
        id: '3',
        first_name: 'Alice',
        last_name: 'Johnson'
      }
    }
  }
};

// export const SuggestedReminder2: Story = {
//   args: {
//     action: mockData[14]
//   }
// };
