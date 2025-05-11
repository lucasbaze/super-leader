import type { Meta, StoryObj } from '@storybook/react';

import { ContextSummary } from './context-summary';

const meta: Meta<typeof ContextSummary> = {
  title: 'Context/ContextSummary',
  component: ContextSummary,
  parameters: {
    layout: 'fullscreen'
  }
};

export default meta;
type Story = StoryObj<typeof ContextSummary>;

export const Default: Story = {
  args: {
    data: {
      completeness: 100,
      followUpQuestions: [],
      groupedSections: [
        {
          title: 'Introduction',
          sections: [
            {
              title: 'INFJ Personality Overview',
              icon: '💖',
              content:
                "People with the INFJ personality type (Advocates) rarely settle for shallow, superficial friendships. When it comes to social fulfillment, they aren't satisfied by casual interactions with colleagues or classmates. INFJ personalities crave authentic, meaningful friendships – friendships that allow them to share their dreams, bare their soul, and feel understood and accepted for who they are. And if that means having just one or two confidants rather than a wide circle of acquaintances, so be it."
            },
            {
              title: 'Social Dynamics',
              icon: '💖',
              content:
                'While INFJs may seem quiet or reserved to the world at large, these personalities absolutely light up around their close friends. Few things bring them more pleasure or delight than talking through their passions, interests, and beliefs with a kindred spirit. People with this personality type enjoy the pleasure of their own company, but they still find it liberating to let their guard down and be completely and utterly themselves with a friend who they know they can trust.'
            }
          ]
        },
        {
          title: 'Strengths & Weaknesses',
          sections: [
            {
              title: 'Searching for a Heart of Gold',
              icon: '💖',
              content:
                "INFJs are known for having great expectations – not just for themselves but also for their friendships. High on this list of expectations is authenticity. If they have to be fake or tone themselves down to gain someone's approval, then that person probably isn't the best friend for them. And it's hard for people with this personality type to respect someone who isn't also an authentic and honest person themselves."
            },
            {
              title: 'Mutual Growth',
              icon: '💖',
              content:
                "Another expectation that INFJs bring to their friendships is mutual support and growth. Having fun together is wonderful, but for these personalities, it isn't quite enough. They want to surround themselves with friends who inspire them to learn, expand, and improve themselves. For INFJs, the surest way for two friends to deepen their bond is by helping each other move forward on their respective life missions."
            }
          ]
        },
        {
          title: 'Romantic Relationships',
          sections: [
            {
              title: 'Soulmate Connections',
              icon: '💖',
              content:
                "In friendship, INFJs aren't just searching for someone to spend time with. They want to find a soulmate – someone who resonates with their passions and their convictions."
            },
            {
              title: 'Finding Compatible Friends',
              icon: '💖',
              content:
                "This can be a tall order for many personalities. INFJs often feel that it's difficult to meet the sort of friends that they're seeking – friends who share the same idealistic values. As a result, people with this personality type may sometimes worry that they need to settle for less-than-fulfilling friendships – or else accept being alone."
            }
          ]
        },
        {
          title: 'Friendships',
          sections: [
            {
              title: 'Loyalty and Authenticity',
              icon: '💖',
              content:
                'Fortunately, they are more than capable of finding the types of friends that they long to meet – they might just have to devote additional energy to it. And when people with the INFJ personality type do encounter like-minded individuals, the bonds that form are profoundly deep and meaningful, making the search worthwhile.'
            },
            {
              title: 'Hidden Depths',
              icon: '💖',
              content:
                "INFJs should keep in mind that sometimes the friends they seek might be hiding in plain sight, among acquaintances whom they simply don't know all that well. This personality type is known for having astute first impressions of other people, but even they can miss the deeper potentials of the people they encounter on a daily basis. When they give these strangers a chance, INFJ personalities may find that they share values and attitudes that make them compatible on a deeper level."
            }
          ]
        },
        {
          title: 'Parenthood',
          sections: [
            {
              title: 'Parenting Approach',
              icon: '💖',
              content:
                'As parents, INFJs are deeply committed to raising children who are not only successful but also ethical and compassionate. They take a holistic approach to parenting, focusing on emotional intelligence alongside academic achievement.'
            }
          ]
        },
        {
          title: 'Career Paths',
          sections: [
            {
              title: 'Professional Strengths',
              icon: '💖',
              content:
                'INFJs thrive in careers that align with their values and allow them to make a positive impact. They excel in roles that require empathy, creativity, and deep thinking.'
            },
            {
              title: 'Workplace Challenges',
              icon: '💖',
              content:
                'Despite their capabilities, INFJs may struggle in highly competitive or impersonal work environments. They prefer collaboration over competition and may become discouraged if they feel their work lacks meaning or purpose.'
            }
          ]
        },
        {
          title: 'Workplace Habits',
          sections: [
            {
              title: 'Work Style',
              icon: '💖',
              content:
                'In the workplace, INFJs prefer quiet, harmonious environments where they can focus deeply on meaningful projects. They work best when they have autonomy and the freedom to approach tasks in their own way.'
            }
          ]
        },
        {
          title: 'Conclusion',
          sections: [
            {
              title: 'Embracing the INFJ Path',
              icon: '💖',
              content:
                'For INFJs, life is a continuous journey of self-discovery and growth. By embracing their unique strengths and working on their challenges, they can build fulfilling relationships and careers that align with their deepest values.'
            }
          ]
        }
      ]
    }
  }
};

export const Empty: Story = {
  args: {
    data: {
      groupedSections: [],
      completeness: 0,
      followUpQuestions: []
    }
  }
};
