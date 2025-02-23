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
      highlights:
        'Tim Cook is a meticulous and strategic leader known for his operational expertise, disciplined financial management, and strong ethical values. He operates with a long-term mindset, emphasizing supply chain efficiency, environmental responsibility, and user privacy. Cook is calculated in decision-making, preferring data-driven insights over gut instincts, and maintains a reserved but approachable demeanor in business.',
      groupedSections: [
        {
          sections: [
            {
              title: 'Relationship Context & History',
              icon: '🔗',
              content:
                'We were introduced through a high-level Apple investor relations meeting. The relationship is currently in an exploratory stage, with the potential for strategic investment in a next-generation Apple product.'
              // forYou:
              //   'Cook is pragmatic about investor relations. He values long-term stability over short-term financial gains.'
            },
            {
              title: 'Personal Background',
              icon: '🏡',
              content:
                'Full name: Timothy Donald Cook. Born on November 1, 1960, in Robertsdale, Alabama. Raised in a modest, working-class family. Has a strong ethical compass and a deep commitment to privacy and social causes.'
              // forYou:
              //   'Cook appreciates partners who are disciplined, detail-oriented, and value structure.'
            },
            {
              title: 'Professional & Career Insights',
              icon: '📈',
              content:
                "CEO of Apple since 2011. Previously Apple’s Chief Operating Officer, known for revolutionizing Apple's supply chain. Led Apple's shift toward services and sustainability while maintaining profit margins."
              // forYou:
              //   'Cook is an operational genius. If you want to invest in an Apple project, ensure your pitch highlights execution and financial sustainability.'
            }
          ],
          suggestion: {
            content:
              'Frame any investment opportunity in terms of efficiency, long-term sustainability, and operational excellence rather than market disruption.',
            reason:
              'Cook is highly risk-averse and focused on execution. He is unlikely to be swayed by visionary pitches that lack immediate practicality.'
          }
        },
        {
          sections: [
            {
              title: 'Social & Network Influence',
              icon: '🌍',
              content:
                'Highly connected within the tech, finance, and political worlds but keeps a smaller personal circle. Trusted advisors include Apple CFO Luca Maestri and COO Jeff Williams.'
              // forYou:
              //   'Cook does not like being pressured or rushed into partnerships. He is deeply loyal to his inner circle.'
            },
            {
              title: 'Communication & Interaction Style',
              icon: '📞',
              content:
                'Prefers email for business communication and is known for short, precise responses. Highly structured in meetings, dislikes ambiguity.'
              // forYou:
              //   'If you communicate with Cook, be direct, concise, and data-backed. Avoid speculative or overly visionary language.'
            }
          ],
          suggestion: {
            content:
              'Emphasize how your investment aligns with Apple’s values around privacy, security, and ecosystem control.',
            reason:
              'Cook prioritizes user trust and data protection. Any product or investment that undermines these values will be a non-starter.'
          }
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
              // forYou:
              //   'Cook values structure and methodical thinking. If proposing an investment, frame it in terms of data and execution.'
            },
            {
              title: 'Lifestyle & Personal Preferences',
              icon: '🏃',
              content:
                'Wakes up at 4 AM, prioritizes fitness. Simple lifestyle, minimal social media presence. Prefers quiet environments and avoids extravagant displays of wealth.'
              // forYou:
              //   'Cook respects discipline. Demonstrating a structured and purposeful lifestyle will resonate more than flashy displays of success.'
            },
            {
              title: 'Pain Points, Challenges & Frustrations',
              icon: '⚠️',
              content:
                'Faces increasing regulatory scrutiny and antitrust concerns. Managing supply chain dependencies in a volatile geopolitical climate.'
              // forYou:
              //   'Understanding regulatory and supply chain challenges can help tailor investment pitches that address Apple’s pain points.'
            }
          ],
          suggestion: {
            content: 'Highlight potential regulatory advantages of your investment.',
            reason:
              'Apple is under increasing scrutiny from regulators. If your investment can help mitigate regulatory risk, it will gain more traction.'
          }
        },
        {
          sections: [
            {
              title: 'Future Outlook & Goals',
              icon: '🚀',
              content:
                'Focused on Apple’s transition to services and AR/VR. Long-term goal is to maintain Apple’s premium brand positioning while expanding into AI, health tech, and spatial computing.'
              // forYou:
              //   'Cook will only support investments that align with Apple’s long-term roadmap—sustainability, privacy, and premium user experience.'
            }
          ],
          suggestion: {
            content: 'Avoid pressuring for quick decisions or aggressive terms.',
            reason:
              'Cook is methodical and does not respond well to high-pressure tactics. Patience and alignment with Apple’s long-term vision are critical.'
          }
        }
      ]
    }
  }
};
