import { faker } from '@faker-js/faker';

import { Address, ContactMethod, Interaction, Website } from './types';

export function generateRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateAddresses(personId: string, userId: string, count: number): Address[] {
  const addresses: Address[] = [];
  const countries = ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'Japan', 'France'];

  for (let i = 0; i < count; i++) {
    addresses.push({
      person_id: personId,
      user_id: userId,
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      postal_code: faker.location.zipCode(),
      country: countries[Math.floor(Math.random() * countries.length)],
      is_primary: i === 0,
      label: ['Home', 'Work', 'Vacation', 'Summer House', 'Winter Home'][
        Math.floor(Math.random() * 5)
      ]
    });
  }

  return addresses;
}

export function generateContactMethods(personId: string, userId: string): ContactMethod[] {
  const methods: ContactMethod[] = [];
  const count = generateRandomNumber(1, 7);

  // Add random additional contact methods
  const types = ['email', 'phone', 'whatsapp', 'telegram', 'signal', 'discord', 'skype'];

  for (let i = 1; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    methods.push({
      person_id: personId,
      user_id: userId,
      type,
      value: type === 'email' ? faker.internet.email() : faker.phone.number(),
      is_primary: i === 0,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Contact`,
      is_contact_method: true,
      platform_icon: type
    });
  }

  return methods;
}

export function generateWebsites(personId: string, userId: string): Website[] {
  const websites: Website[] = [];
  const count = generateRandomNumber(0, 20);

  const platforms = [
    { name: 'github', domain: 'github.com' },
    { name: 'linkedin', domain: 'linkedin.com' },
    { name: 'twitter', domain: 'twitter.com' },
    { name: 'facebook', domain: 'facebook.com' },
    { name: 'instagram', domain: 'instagram.com' },
    { name: 'youtube', domain: 'youtube.com' },
    { name: 'medium', domain: 'medium.com' },
    { name: 'dev.to', domain: 'dev.to' },
    { name: 'x', domain: 'x.com' }
  ];

  for (let i = 0; i < count; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    websites.push({
      person_id: personId,
      user_id: userId,
      url: `https://${platform.domain}/${faker.internet.username()}`,
      icon: platform.name,
      label: `${platform.name} Profile`
    });
  }

  return websites;
}

export function generateInteractions(
  personId: string,
  userId: string
): Array<{
  person_id: string;
  user_id: string;
  type: Interaction['type'];
  note: Interaction['note'];
}> {
  const count = generateRandomNumber(0, 7);
  const interactions = [];

  const noteTypes = ['meeting', 'call', 'email', 'note', 'social'];

  const noteTemplates = {
    'context-and-history': [
      'First met at {{event}} in {{year}}. {{name}} was introduced by {{connection}}.',
      'Known each other for {{years}} years through {{context}}. Started as {{relationship}}.',
      'Connected initially through {{platform}}. Common interest in {{topic}}.'
    ],
    'personal-background': [
      'Grew up in {{location}}. Family has {{background}} heritage.',
      'Married with {{number}} kids. Youngest is {{age}} years old.',
      'Recently moved from {{city}} for {{reason}}.'
    ],
    'professional-and-career-insights': [
      'Currently {{position}} at {{company}}. Passionate about {{industry}}.',
      'Building {{project}} with focus on {{goal}}.',
      'Transitioning from {{previous}} to {{current}} career path.'
    ],
    'social-and-network-influence': [
      'Well connected in {{industry}} circles. Close with {{person}}.',
      'Active member of {{group}}. Frequently hosts {{event_type}} events.',
      'Influential in {{community}}. Known for {{expertise}}.'
    ],
    'communication-and-interaction-style': [
      'Prefers {{communication_style}} communication. Best reached via {{channel}}.',
      'Direct and {{trait}} in meetings. Values {{quality}} in discussions.',
      '{{style}} negotiator. Responds well to {{approach}}.'
    ],
    'financial-and-business-philosophy': [
      'Conservative with {{resource}}. Focuses on {{strategy}}.',
      'Interested in {{investment_type}}. Has experience with {{venture}}.',
      'Values {{principle}} in business dealings. Cautious about {{risk}}.'
    ],
    'psychological-and-behavioral-insights': [
      'Shows {{trait}} under pressure. Motivated by {{driver}}.',
      '{{personality_type}} personality. Thrives in {{environment}}.',
      'Struggles with {{challenge}}. Copes through {{mechanism}}.'
    ],
    'lifestyle-and-personal-preferences': [
      'Avid {{hobby}} enthusiast. Collects {{item}}.',
      'Travels frequently to {{destination}} for {{purpose}}.',
      'Health-conscious, focuses on {{activity}}. Avoids {{restriction}}.'
    ],
    'pains-challenges-and-frustrations': [
      'Frustrated with {{issue}} at work. Seeking solutions for {{problem}}.',
      'Concerned about {{topic}}. Looking for advice on {{subject}}.',
      'Struggling with {{challenge}}. Needs support with {{area}}.'
    ],
    'future-outlook-and-goals': [
      'Planning to {{goal}} within {{timeframe}}. Seeking {{resource}}.',
      'Ambitious about {{project}}. Wants to achieve {{milestone}}.',
      'Looking to transition into {{field}}. Interested in {{opportunity}}.'
    ],
    'influence-and-power-dynamics': [
      'Key decision maker for {{domain}}. Influences {{stakeholders}}.',
      'Respected voice in {{community}}. Known for {{reputation}}.',
      'Controls {{resource}}. Important relationship for {{reason}}.'
    ],
    'legacy-and-personal-impact': [
      'Working on {{project}} to impact {{beneficiary}}.',
      'Passionate about {{cause}}. Dedicated to {{mission}}.',
      'Wants to be remembered for {{achievement}}. Building {{legacy}}.'
    ]
  };

  const fillTemplate = (template: string) => {
    return template.replace(/\{\{(\w+)\}\}/g, () => faker.word.sample());
  };

  for (let i = 0; i < count; i++) {
    const category = faker.helpers.arrayElement(Object.keys(noteTemplates));
    const templates = noteTemplates[category as keyof typeof noteTemplates];
    const template = faker.helpers.arrayElement(templates);

    interactions.push({
      person_id: personId,
      user_id: userId,
      type: faker.helpers.arrayElement(noteTypes),
      note: fillTemplate(template)
    });
  }

  return interactions;
}
