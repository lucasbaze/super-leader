import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';

import { SUGGESTED_ACTION_TYPES, TASK_TRIGGERS } from '@/lib/tasks/constants';
import { GetTaskSuggestionResult, shareContentActionSchema } from '@/services/tasks/types';

import { ShareContentTask } from './share-content-task';

const meta = {
  title: 'Components/Tasks/ShareContentTask',
  component: ShareContentTask,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
} satisfies Meta<typeof ShareContentTask>;

export default meta;
type Story = StoryObj<typeof ShareContentTask>;

export const Default: Story = {
  args: {
    task: {
      id: '123',
      person: {
        id: '456',
        first_name: 'Michael',
        last_name: 'Bashour'
      },
      trigger: TASK_TRIGGERS.FOLLOW_UP,
      completed_at: null,
      created_at: '2024-01-01T00:00:00Z',
      end_at: '2024-01-01T00:00:00Z',
      bad_suggestion: false,
      bad_suggestion_reason: null,
      skipped_at: null,
      snoozed_at: null,
      updated_at: '2024-01-01T00:00:00Z',
      context: {
        context: "You requested to be notified about Michael's recent trip",
        callToAction:
          "Share an interesting article about the Himalaya's in reference to his upcoming trip."
      },
      suggested_action_type: SUGGESTED_ACTION_TYPES.SHARE_CONTENT,
      suggested_action: {
        contentVariants: [
          {
            suggestedContent: {
              title: 'The Himalayas: A Complete Travel Guide',
              description:
                'An in-depth guide to planning your Himalayan adventure, from best times to visit to essential gear.',
              url: 'https://example.com/himalaya-travel-guide'
            },
            messageVariants: [
              {
                tone: 'Professional',
                message:
                  "Hi Michael, I came across this comprehensive guide about traveling in the Himalayas. Given your upcoming trip, I thought you might find it useful for your planning. It covers everything from weather conditions to recommended gear. Let me know if you'd like to discuss any specific aspects of your itinerary."
              },
              {
                tone: 'Casual',
                message:
                  "Hey Michael! Found this awesome guide about the Himalayas - perfect timing for your trip! It's got some really cool tips about what to pack and when to go. Thought you might want to check it out. Super excited to hear about your adventure!"
              }
            ]
          },
          {
            suggestedContent: {
              title: 'Hidden Gems of the Himalayas',
              description:
                'Discover lesser-known destinations and unique experiences in the Himalayan region.',
              url: 'https://example.com/himalaya-hidden-gems'
            },
            messageVariants: [
              {
                tone: 'Professional',
                message:
                  'Michael, I thought you might be interested in this article about some of the lesser-known spots in the Himalayas. It could add some unique destinations to your itinerary. The section about local customs and traditions is particularly insightful.'
              },
              {
                tone: 'Casual',
                message:
                  "Hey Michael! Check this out - found some really cool hidden spots in the Himalayas you might want to add to your list! There's some amazing places most tourists don't know about. Thought it might help make your trip even more special!"
              }
            ]
          }
        ]
      }
    }
  }
};

// export const WithLongContent: Story = {
//   args: {
//     task: {
//       ...mockTask,
//       suggested_action: {
//         contentVariants: [
//           {
//             suggestedContent: {
//               title: 'The Ultimate Guide to Himalayan Trekking: Everything You Need to Know Before Your Adventure',
//               description: 'A comprehensive guide covering all aspects of Himalayan trekking, from physical preparation and altitude acclimatization to choosing the right routes and understanding local customs. This in-depth resource includes expert advice, detailed itineraries, and essential safety tips for both beginner and experienced trekkers.',
//               url: 'https://example.com/ultimate-himalaya-guide'
//             },
//             messageVariants: [
//               {
//                 tone: 'Professional',
//                 message: 'Michael, I came across this extensive guide about trekking in the Himalayas. Given your upcoming adventure, I thought you might find this particularly valuable. It covers everything from physical preparation to cultural considerations. The section about altitude acclimatization is especially relevant for first-time Himalayan trekkers.'
//               },
//               {
//                 tone: 'Casual',
//                 message: 'Hey Michael! Found this super detailed guide about Himalayan trekking - it's basically everything you need to know in one place! The tips about dealing with altitude and local customs are really helpful. Thought you'd want to check it out before your big adventure!'
//               }
//             ]
//           }
//         ]
//       }
//     }
//   }
// };

// export const WithMultipleContentOptions: Story = {
//   args: {
//     task: {
//       ...mockTask,
//       suggested_action: {
//         contentVariants: [
//           ...mockTask.suggested_action.contentVariants,
//           {
//             suggestedContent: {
//               title: 'Best Photography Spots in the Himalayas',
//               description: 'A photographer's guide to capturing the most stunning views and moments in the Himalayan range.',
//               url: 'https://example.com/himalaya-photography'
//             },
//             messageVariants: [
//               {
//                 tone: 'Professional',
//                 message: 'Michael, knowing your interest in photography, I thought you'd appreciate this guide about the best photography locations in the Himalayas. It includes detailed information about timing and equipment recommendations.'
//               },
//               {
//                 tone: 'Casual',
//                 message: 'Hey Michael! Since you're into photography, check out this awesome guide about photo spots in the Himalayas! Some really epic locations in here - perfect for getting those Instagram-worthy shots! 📸'
//               }
//             ]
//           }
//         ]
//       }
//     }
//   }
// };
