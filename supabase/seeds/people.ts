import { faker } from '@faker-js/faker';

import { SeedContext } from './types';
import { generateAddresses, generateContactMethods, generateRandomNumber, generateWebsites } from './utils';

export async function seedPeople({ supabase, userId }: SeedContext) {
  const totalPeople = 30;

  for (let i = 0; i < totalPeople; i++) {
    // Create person
    const personId = crypto.randomUUID();
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    // Determine what kind of test case this will be
    const testCase = i % 5; // This gives us 5 different types of test cases
    let bio = '';

    switch (testCase) {
      case 0:
        bio = 'Test case: Heavy email user with multiple email addresses';
        break;
      case 1:
        bio = 'Test case: International person with multiple physical addresses';
        break;
      case 2:
        bio = 'Test case: Digital creator with many websites and social profiles';
        break;
      case 3:
        bio = 'Test case: Well-connected person with multiple contact methods';
        break;
      case 4:
        bio = 'Test case: Minimal contact information';
        break;
    }

    // Insert person with proper typing
    const { error: personError } = await supabase.from('person').insert({
      first_name: firstName,
      last_name: lastName,
      bio,
      birthday: faker.date.past().toISOString(),
      date_met: faker.date.recent().toISOString(),
      user_id: userId
    });

    if (personError) throw personError;

    // Get the inserted person's ID
    const { data: insertedPerson, error: fetchError } = await supabase
      .from('person')
      .select('id')
      .eq('user_id', userId)
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .single();

    if (fetchError) throw fetchError;
    if (!insertedPerson) throw new Error('Failed to fetch inserted person');

    const insertedPersonId = insertedPerson.id;

    // Generate and insert addresses
    const addressCount = testCase === 1 ? generateRandomNumber(3, 5) : generateRandomNumber(0, 2);
    const addresses = generateAddresses(insertedPersonId, userId, addressCount);
    if (addresses.length > 0) {
      const { error: addressError } = await supabase.from('addresses').insert(addresses);
      if (addressError) throw addressError;
    }

    // Generate and insert contact methods
    const contactMethods = generateContactMethods(insertedPersonId, userId);
    const { error: contactError } = await supabase.from('contact_methods').insert(contactMethods);
    if (contactError) throw contactError;

    // Generate and insert websites
    const websites = generateWebsites(insertedPersonId, userId);
    if (websites.length > 0) {
      const { error: websiteError } = await supabase.from('websites').insert(websites);
      if (websiteError) throw websiteError;
    }
  }
}
