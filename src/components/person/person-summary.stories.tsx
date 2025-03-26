import type { Meta, StoryObj } from '@storybook/react';

import { PersonSummary } from './person-summary';

const meta: Meta<typeof PersonSummary> = {
  title: 'Person/PersonSummary',
  component: PersonSummary,
  parameters: {
    layout: 'centered'
  }
};

export default meta;
type Story = StoryObj<typeof PersonSummary>;

export const Default: Story = {
  args: {
    data: {
      completeness: 95,
      followUpQuestions: [
        'What is Tim Cooks current job or career focus?',
        'What specific skills or expertise does Tim Cook have?',
        'Has Tim Cook achieved any notable professional accomplishments?',
        "What are Tim Cook's long-term goals or aspirations?"
      ],
      insightRecommendations: [
        {
          title: 'Gift suggestion',
          icon: '🎁',
          insightRecommendation:
            'Tim Cook loves cooked eels over the fire with marshmellows. He would probably love a camping trip in the woods with his family too.'
        },
        {
          title: 'Communication suggestion',
          icon: '📞',
          insightRecommendation:
            'Tim Cook is a meticulous and strategic leader known for his operational expertise, disciplined financial management, and strong ethical values. He operates with a long-term mindset, emphasizing supply chain efficiency, environmental responsibility, and user privacy. Cook is calculated in decision-making, preferring data-driven insights over gut instincts, and maintains a reserved but approachable demeanor in business.'
        }
      ],
      groupedSections: [
        {
          sections: [
            {
              title: 'Relationship Context & History',
              icon: '🔗',
              content:
                'We were introduced through a high-level Apple investor relations meeting. The relationship is currently in an exploratory stage, with the potential for strategic investment in a next-generation Apple product.'
            },
            {
              title: 'Personal Background',
              icon: '🏡',
              content:
                'Full name: Timothy Donald Cook. Born on November 1, 1960, in Robertsdale, Alabama. Raised in a modest, working-class family. Has a strong ethical compass and a deep commitment to privacy and social causes.'
            },
            {
              title: 'Professional & Career Insights',
              icon: '📈',
              content:
                "CEO of Apple since 2011. Previously Apple’s Chief Operating Officer, known for revolutionizing Apple's supply chain. Led Apple's shift toward services and sustainability while maintaining profit margins."
            }
          ]
        },
        {
          sections: [
            {
              title: 'Social & Network Influence',
              icon: '🌍',
              content:
                'Highly connected within the tech, finance, and political worlds but keeps a smaller personal circle. Trusted advisors include Apple CFO Luca Maestri and COO Jeff Williams.'
            },
            {
              title: 'Communication & Interaction Style',
              icon: '📞',
              content:
                'Prefers email for business communication and is known for short, precise responses. Highly structured in meetings, dislikes ambiguity.'
            }
          ]
        },
        {
          sections: [
            {
              title: 'Financial & Business Philosophy',
              icon: '💰',
              content:
                'Highly disciplined financial strategist. Prioritizes long-term sustainability over short-term profits. Avoids high-risk speculative investments.'
              // forYou:
              //   'Cook does not invest in high-risk projects. Any investment opportunity should align with Apple’s existing strengths.'
            },
            {
              title: 'Psychological Profile & Behavioral Insights',
              icon: '🧠',
              content:
                'Extremely disciplined and structured thinker. Introverted but highly methodical in decision-making. Highly risk-averse but willing to take bold steps when backed by evidence.'
            },
            {
              title: 'Lifestyle & Personal Preferences',
              icon: '🏃',
              content:
                'Wakes up at 4 AM, prioritizes fitness. Simple lifestyle, minimal social media presence. Prefers quiet environments and avoids extravagant displays of wealth.'
            },
            {
              title: 'Pain Points, Challenges & Frustrations',
              icon: '⚠️',
              content:
                'Faces increasing regulatory scrutiny and antitrust concerns. Managing supply chain dependencies in a volatile geopolitical climate.'
            }
          ]
        },
        {
          sections: [
            {
              title: 'Future Outlook & Goals',
              icon: '🚀',
              content:
                'Focused on Apple’s transition to services and AR/VR. Long-term goal is to maintain Apple’s premium brand positioning while expanding into AI, health tech, and spatial computing.'
            }
          ]
        }
      ]
    }
  }
};
