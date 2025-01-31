import { SupabaseClient } from '@supabase/supabase-js';

import { createSupabaseAdminClient } from './test-client';

export interface TestPerson {
  user_id: string;
  first_name: string;
  last_name: string;
  id?: string;
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
    // postal_code: string;
    country: string;
  }>;
  websites?: Array<{
    url: string;
    type: string;
  }>;
}

export async function withTestTransaction(callback: (supabase: SupabaseClient) => Promise<void>) {
  const supabaseAdminClient = createSupabaseAdminClient();
  try {
    // Start transaction
    await supabaseAdminClient.rpc('begin_test_transaction');

    // Run the test
    await callback(supabaseAdminClient);
  } finally {
    // Always rollback the transaction
    await supabaseAdminClient.rpc('rollback_test_transaction');
  }
}

export async function createTestPerson(supabase: SupabaseClient, personData: TestPerson) {
  const testPrefix = 'test_';

  const { data: person, error } = await supabase
    .from('person')
    .insert({
      first_name: `${testPrefix}${personData.first_name}`,
      last_name: `${testPrefix}${personData.last_name}`,
      bio: personData.bio ? `${testPrefix}${personData.bio}` : null,
      user_id: personData.user_id
    })
    .select()
    .single();

  if (error) throw error;

  if (personData.contactMethods) {
    const { error: contactError } = await supabase.from('contact_methods').insert(
      personData.contactMethods.map((cm) => ({
        person_id: person.id,
        user_id: personData.user_id,
        type: `${testPrefix}${cm.type}`,
        value: `${testPrefix}${cm.value}`,
        is_primary: false,
        is_contact_method: true,
        label: `${testPrefix}${cm.type}`
      }))
    );
    if (contactError) throw contactError;
  }

  if (personData.addresses) {
    const { error: addressError } = await supabase.from('addresses').insert(
      personData.addresses.map((addr) => ({
        person_id: person.id,
        user_id: personData.user_id,
        street: `${testPrefix}${addr.street}`,
        city: `${testPrefix}${addr.city}`,
        state: addr.state,
        // postal_code: addr.postal_code,
        country: `${testPrefix}${addr.country}`,
        is_primary: false,
        label: `${testPrefix}${addr.type}`
      }))
    );
    if (addressError) throw addressError;
  }

  if (personData.websites) {
    const { error: websiteError } = await supabase.from('websites').insert(
      personData.websites.map((web) => ({
        person_id: person.id,
        user_id: personData.user_id,
        url: `${testPrefix}${web.url}`,
        label: `${testPrefix}${web.type}`,
        icon: web.type
      }))
    );
    if (websiteError) throw websiteError;
  }

  return person;
}
