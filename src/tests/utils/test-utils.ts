import { SupabaseClient } from '@supabase/supabase-js';

import { createTestClient } from './test-client';

export interface TestPerson {
  id?: string;
  first_name: string;
  last_name: string;
  bio?: string;
  contactMethods?: Array<{
    type: string;
    value: string;
  }>;
  addresses?: Array<{
    type: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }>;
  websites?: Array<{
    url: string;
    type: string;
  }>;
}

export async function withTestTransaction(callback: (supabase: SupabaseClient) => Promise<void>) {
  const supabase = createTestClient();

  try {
    // Start transaction
    await supabase.rpc('begin_test_transaction');

    // Run the test
    await callback(supabase);
  } finally {
    // Always rollback the transaction
    await supabase.rpc('rollback_test_transaction');
  }
}

export async function createTestPerson(supabase: SupabaseClient, personData: TestPerson) {
  const testPrefix = 'test_';

  const { data: person, error } = await supabase
    .from('person')
    .insert({
      first_name: `${testPrefix}${personData.first_name}`,
      last_name: `${testPrefix}${personData.last_name}`,
      bio: personData.bio ? `${testPrefix}${personData.bio}` : null
    })
    .select()
    .single();

  if (error) throw error;

  if (personData.contactMethods) {
    await supabase.from('contact_methods').insert(
      personData.contactMethods.map((cm) => ({
        person_id: person.id,
        type: `${testPrefix}${cm.type}`,
        value: `${testPrefix}${cm.value}`
      }))
    );
  }

  if (personData.addresses) {
    await supabase.from('addresses').insert(
      personData.addresses.map((addr) => ({
        person_id: person.id,
        type: `${testPrefix}${addr.type}`,
        street: `${testPrefix}${addr.street}`,
        city: `${testPrefix}${addr.city}`,
        state: addr.state,
        postal_code: addr.postal_code,
        country: `${testPrefix}${addr.country}`
      }))
    );
  }

  if (personData.websites) {
    await supabase.from('websites').insert(
      personData.websites.map((web) => ({
        person_id: person.id,
        url: `${testPrefix}${web.url}`,
        type: `${testPrefix}${web.type}`
      }))
    );
  }

  return person;
}
