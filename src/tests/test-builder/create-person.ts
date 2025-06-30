import { DBClient } from '@/types/database';

export interface TestPerson {
  user_id: string;
  first_name: string;
  last_name: string;
  id?: string;
  bio?: string;
  title?: string;
  birthday?: string;
  linkedin_public_id?: string;
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
  completeness_score?: number;
}

export interface CreateTestPersonParams {
  db: DBClient;
  data: TestPerson;
}

export async function createTestPerson({ db, data }: CreateTestPersonParams) {
  const { data: person, error } = await db
    .from('person')
    .insert({
      first_name: data.first_name,
      last_name: data.last_name,
      bio: data.bio || null,
      user_id: data.user_id,
      birthday: data.birthday || null,
      completeness_score: data.completeness_score || null,
      linkedin_public_id: data.linkedin_public_id || null,
      title: data.title || null
    })
    .select()
    .single();

  if (error) throw error;

  if (data.contactMethods) {
    const { error: contactError } = await db.from('contact_methods').insert(
      data.contactMethods.map((cm) => ({
        person_id: person.id,
        user_id: data.user_id,
        type: cm.type,
        value: cm.value,
        is_primary: false,
        is_contact_method: true,
        label: cm.type
      }))
    );
    if (contactError) throw contactError;
  }

  if (data.addresses) {
    const { error: addressError } = await db.from('addresses').insert(
      data.addresses.map((addr) => ({
        person_id: person.id,
        user_id: data.user_id,
        street: addr.street,
        city: addr.city,
        state: addr.state,
        // postal_code: addr.postal_code,
        country: addr.country,
        is_primary: false,
        label: addr.type
      }))
    );
    if (addressError) throw addressError;
  }

  if (data.websites) {
    const { error: websiteError } = await db.from('websites').insert(
      data.websites.map((web) => ({
        person_id: person.id,
        user_id: data.user_id,
        url: web.url,
        label: web.type,
        icon: web.type
      }))
    );
    if (websiteError) throw websiteError;
  }

  return person;
}
