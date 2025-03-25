import type { Meta, StoryObj } from '@storybook/react';

import { TaskCard } from './task-card';

const meta: Meta<typeof TaskCard> = {
  title: 'Components/Home/TaskCard',
  component: TaskCard,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof TaskCard>;

// Mock handlers
const mockHandlers = {
  onCopy: (content: string) => console.log('Copy clicked:', content),
  onOpenChat: (person: any, content: string) =>
    console.log('Open chat clicked:', { person, content }),
  onTaskAction: (action: string) => console.log('Task action clicked:', action)
};

// Base story with default props
export const Default: Story = {
  args: {
    task: {
      id: 1,
      type: 'birthday',
      person: {
        name: 'Alex Johnson',
        avatar: '/placeholder.svg?height=40&width=40',
        contactInfo: {
          email: 'alex@example.com',
          phone: null
        }
      },
      context: "It's Alex's birthday today!",
      suggestedAction: 'Send a birthday message',
      suggestedContent:
        'Happy birthday, Alex! Hope you have a fantastic day filled with joy and celebration. Looking forward to catching up soon!',
      messageVariants: [
        {
          label: 'Professional',
          content:
            'Dear Alex, wishing you a very happy birthday! May your day be filled with joy and success. Best regards.'
        },
        {
          label: 'Casual',
          content: "Happy birthday Alex! 🎉 Hope you have an awesome day! Let's catch up soon!"
        },
        {
          label: 'Celebratory',
          content:
            'Happy birthday to you, Alex! 🎂🎈 Wishing you all the happiness in the world on your special day!'
        }
      ]
    },
    contactInfo: { email: '', phone: '' },
    setContactInfo: (info: { email: string; phone: string }) =>
      console.log('Contact info updated:', info),
    ...mockHandlers
  }
};

// Profile Update Task
export const ProfileUpdate: Story = {
  args: {
    task: {
      id: 2,
      type: 'profile_update',
      person: {
        name: 'Hobart Yundt',
        avatar: '/placeholder.svg?height=40&width=40',
        contactInfo: {
          email: 'hobart@example.com',
          phone: '+1234567890'
        }
      },
      context: 'Missing key information for potential investor',
      suggestedAction: 'Update contact details',
      suggestedContent:
        "Hobart's profile needs updating. Add their current role, company, and preferred contact method to better maintain the relationship."
    },
    contactInfo: { email: '', phone: '' },
    setContactInfo: (info: { email: string; phone: string }) =>
      console.log('Contact info updated:', info),
    ...mockHandlers
  }
};

// Content Share Task
export const ContentShare: Story = {
  args: {
    task: {
      id: 3,
      type: 'content_share',
      person: {
        name: 'Taylor Reed',
        avatar: '/placeholder.svg?height=40&width=40',
        contactInfo: {
          email: 'taylor@example.com',
          phone: null
        }
      },
      context: 'Taylor mentioned interest in AI development',
      suggestedAction: 'Share an article about recent AI advancements',
      suggestedContent:
        'I found some interesting articles about recent developments in AI that Taylor might enjoy.',
      contentSuggestions: [
        {
          title: 'The Future of AI: Trends to Watch in 2025',
          url: 'https://example.com/ai-trends-2025',
          description:
            'A comprehensive overview of emerging AI technologies and their potential impact on various industries.'
        },
        {
          title: 'How Generative AI is Transforming Creative Work',
          url: 'https://example.com/generative-ai-creative',
          description:
            'An exploration of how AI tools are changing the landscape for designers, writers, and other creative professionals.'
        }
      ],
      messageVariants: [
        {
          label: 'Professional',
          content:
            'I thought you might find these articles relevant to your interests in AI development. Please let me know your thoughts.'
        },
        {
          label: 'Casual',
          content:
            "Hey, check out these cool articles I found about AI! Thought you'd like them since you mentioned you're interested in this area."
        }
      ]
    },
    contactInfo: { email: '', phone: '' },
    setContactInfo: (info: { email: string; phone: string }) =>
      console.log('Contact info updated:', info),
    ...mockHandlers
  }
};

// Follow Up Task
export const FollowUp: Story = {
  args: {
    task: {
      id: 4,
      type: 'follow_up',
      person: {
        name: 'Alvera Skiles',
        avatar: '/placeholder.svg?height=40&width=40',
        contactInfo: {
          email: 'alvera@example.com',
          phone: '+1987654321'
        }
      },
      context: 'Recent interaction follow-up',
      suggestedAction: 'Send follow-up message',
      suggestedContent:
        "It's been a while since you last caught up with Alvera. Consider scheduling a coffee chat to discuss their recent projects and maintain the connection.",
      messageVariants: [
        {
          label: 'Professional',
          content:
            'I wanted to follow up on our previous conversation. Would you be available for a brief meeting to discuss further?'
        },
        {
          label: 'Casual',
          content: "Hey! It's been a while. Want to grab coffee and catch up sometime soon?"
        },
        {
          label: 'Friendly',
          content:
            "Miss our chats! We should definitely catch up soon - how's your schedule looking?"
        }
      ]
    },
    contactInfo: { email: '', phone: '' },
    setContactInfo: (info: { email: string; phone: string }) =>
      console.log('Contact info updated:', info),
    ...mockHandlers
  }
};

// Task without contact info
export const NoContactInfo: Story = {
  args: {
    task: {
      id: 5,
      type: 'birthday',
      person: {
        name: 'Eveline Walsh',
        avatar: '/placeholder.svg?height=40&width=40',
        contactInfo: {
          email: null,
          phone: null
        }
      },
      context: "It's Eveline's birthday today!",
      suggestedAction: 'Send a birthday message',
      suggestedContent:
        'Happy birthday, Eveline! Hope you have a fantastic day filled with joy and celebration. Looking forward to catching up soon!',
      messageVariants: [
        {
          label: 'Professional',
          content:
            'Dear Eveline, wishing you a very happy birthday! May your day be filled with joy and success. Best regards.'
        },
        {
          label: 'Casual',
          content: "Happy birthday Eveline! 🎉 Hope you have an awesome day! Let's catch up soon!"
        }
      ]
    },
    contactInfo: { email: '', phone: '' },
    setContactInfo: (info: { email: string; phone: string }) =>
      console.log('Contact info updated:', info),
    ...mockHandlers
  }
};
