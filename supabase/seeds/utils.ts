import { faker } from '@faker-js/faker';

import { Address, ContactMethod, Website } from './types';

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
      country: countries[Math.floor(Math.random() * countries.length)],
      is_primary: i === 0,
      label: ['Home', 'Work', 'Vacation', 'Summer House', 'Winter Home'][Math.floor(Math.random() * 5)]
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
      url: `https://${platform.domain}/${faker.internet.userName()}`,
      icon: platform.name,
      label: `${platform.name} Profile`
    });
  }

  return websites;
}
