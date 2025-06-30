import { SupabaseClient } from '@supabase/supabase-js';

import { createTestPerson } from '@/tests/test-builder/create-person';
import { createTestUser } from '@/tests/test-builder/create-user';
import { withTestTransaction } from '@/tests/utils/test-setup';
import { createClient } from '@/utils/supabase/server';

import { getPerson } from '../../person/get-person';
import {
  ERRORS,
  updatePersonAddress,
  updatePersonContactMethod,
  updatePersonField,
  updatePersonWebsite
} from '../../person/update-person-details';



// Helper to create a test user and person
async function setupUserAndPerson(db: SupabaseClient, personData: any = {}) {
  const testUser = await createTestUser({ db });
  const testPerson = await createTestPerson({
    db,
    data: {
      user_id: testUser.id,
      first_name: 'John',
      last_name: 'Doe',
      ...personData
    }
  });
  return { testUser, testPerson };
}

describe('Person Update Services', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('updatePersonField', () => {
    it('should update a single field', async () => {
      await withTestTransaction(supabase, async (db) => {
        const { testUser, testPerson } = await setupUserAndPerson(db);

        const result = await updatePersonField({
          db,
          personId: testPerson.id,
          field: 'first_name',
          value: 'Jane'
        });

        expect(result.error).toBeNull();

        const updated = await getPerson({
          db,
          personId: testPerson.id
        });

        expect(updated.data?.person.first_name).toBe('Jane');
      });
    });

    it('should clear a field value', async () => {
      await withTestTransaction(supabase, async (db) => {
        const { testUser, testPerson } = await setupUserAndPerson(db, { bio: 'Some bio' });

        const result = await updatePersonField({
          db,
          personId: testPerson.id,
          field: 'bio',
          value: ''
        });

        expect(result.error).toBeNull();

        const updated = await getPerson({
          db,
          personId: testPerson.id
        });

        expect(updated.data?.person.bio).toBeNull();
      });
    });

    it('should handle invalid field updates', async () => {
      await withTestTransaction(supabase, async (db) => {
        const { testUser, testPerson } = await setupUserAndPerson(db);

        const result = await updatePersonField({
          db,
          personId: testPerson.id,
          field: 'nonexistent_field',
          value: 'test'
        });

        expect(result.error).toBeTruthy();
      });
    });
  });

  describe('updatePersonContactMethod', () => {
    it('should create a new contact method', async () => {
      await withTestTransaction(supabase, async (db) => {
        const { testUser, testPerson } = await setupUserAndPerson(db);

        const result = await updatePersonContactMethod({
          db,
          personId: testPerson.id,
          data: {
            type: 'email',
            value: 'test@example.com',
            label: 'Work',
            is_primary: true
          }
        });

        expect(result.error).toBeNull();

        const updated = await getPerson({
          db,
          personId: testPerson.id,
          withContactMethods: true
        });

        expect(updated.data?.contactMethods).toHaveLength(1);
        expect(updated.data?.contactMethods?.[0]).toMatchObject({
          type: 'email',
          value: 'test@example.com',
          label: 'Work',
          is_primary: true
        });
      });
    });

    it('should update an existing contact method', async () => {
      await withTestTransaction(supabase, async (db) => {
        const { testUser, testPerson } = await setupUserAndPerson(db);
        // First create a contact method
        const { data: contact } = await db
          .from('contact_methods')
          .insert({
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'email',
            value: 'old@example.com',
            is_primary: false
          })
          .select()
          .single();

        const result = await updatePersonContactMethod({
          db,
          personId: testPerson.id,
          methodId: contact.id,
          data: {
            type: 'email',
            value: 'new@example.com',
            label: 'Updated',
            is_primary: true
          }
        });

        expect(result.error).toBeNull();

        const updated = await getPerson({
          db,
          personId: testPerson.id,
          withContactMethods: true
        });

        expect(updated.data?.contactMethods).toHaveLength(1);
        expect(updated.data?.contactMethods?.[0]).toMatchObject({
          type: 'email',
          value: 'new@example.com',
          label: 'Updated',
          is_primary: true
        });
      });
    });

    it('should delete a contact method when _delete is true', async () => {
      await withTestTransaction(supabase, async (db) => {
        const { testUser, testPerson } = await setupUserAndPerson(db);
        // First create a contact method
        const { data: contact } = await db
          .from('contact_methods')
          .insert({
            person_id: testPerson.id,
            user_id: testUser.id,
            type: 'email',
            value: 'delete@example.com',
            is_primary: false
          })
          .select()
          .single();

        const result = await updatePersonContactMethod({
          db,
          personId: testPerson.id,
          methodId: contact.id,
          data: {
            _delete: true,
            type: 'email',
            value: 'delete@example.com',
            is_primary: false
          }
        });

        expect(result.error).toBeNull();

        const updated = await getPerson({
          db,
          personId: testPerson.id,
          withContactMethods: true
        });

        expect(updated.data?.contactMethods).toHaveLength(0);
      });
    });
  });

  describe('updatePersonAddress', () => {
    it('should create a new address', async () => {
      await withTestTransaction(supabase, async (db) => {
        const { testUser, testPerson } = await setupUserAndPerson(db);

        const result = await updatePersonAddress({
          db,
          personId: testPerson.id,
          data: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            postal_code: '12345',
            country: 'Test Country',
            label: 'Home',
            is_primary: true
          }
        });

        expect(result.error).toBeNull();

        const updated = await getPerson({
          db,
          personId: testPerson.id,
          withAddresses: true
        });

        expect(updated.data?.addresses).toHaveLength(1);
        expect(updated.data?.addresses?.[0]).toMatchObject({
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345',
          country: 'Test Country',
          label: 'Home',
          is_primary: true
        });
      });
    });

    it('should update an existing address', async () => {
      await withTestTransaction(supabase, async (db) => {
        const { testUser, testPerson } = await setupUserAndPerson(db);
        // First create an address
        const { data: address } = await db
          .from('addresses')
          .insert({
            person_id: testPerson.id,
            user_id: testUser.id,
            street: 'Old St',
            city: 'Old City',
            state: 'OS',
            postal_code: '00000',
            country: 'Old Country',
            label: 'Old',
            is_primary: false
          })
          .select()
          .single();

        const result = await updatePersonAddress({
          db,
          personId: testPerson.id,
          addressId: address.id,
          data: {
            street: 'New St',
            city: 'New City',
            state: 'NS',
            postal_code: '99999',
            country: 'New Country',
            label: 'New',
            is_primary: true
          }
        });

        expect(result.error).toBeNull();

        const updated = await getPerson({
          db,
          personId: testPerson.id,
          withAddresses: true
        });

        expect(updated.data?.addresses).toHaveLength(1);
        expect(updated.data?.addresses?.[0]).toMatchObject({
          street: 'New St',
          city: 'New City',
          state: 'NS',
          postal_code: '99999',
          country: 'New Country',
          label: 'New',
          is_primary: true
        });
      });
    });

    it('should delete an address when _delete is true', async () => {
      await withTestTransaction(supabase, async (db) => {
        const { testUser, testPerson } = await setupUserAndPerson(db);
        // First create an address
        const { data: address } = await db
          .from('addresses')
          .insert({
            person_id: testPerson.id,
            user_id: testUser.id,
            street: 'Delete St',
            city: 'Delete City',
            state: 'DS',
            postal_code: '11111',
            country: 'Delete Country',
            label: 'Delete',
            is_primary: false
          })
          .select()
          .single();

        const result = await updatePersonAddress({
          db,
          personId: testPerson.id,
          addressId: address.id,
          data: {
            _delete: true,
            street: 'Delete St',
            city: 'Delete City',
            state: 'DS',
            postal_code: '11111',
            country: 'Delete Country',
            label: 'Delete',
            is_primary: false
          }
        });

        expect(result.error).toBeNull();

        const updated = await getPerson({
          db,
          personId: testPerson.id,
          withAddresses: true
        });

        expect(updated.data?.addresses).toHaveLength(0);
      });
    });
  });

  describe('updatePersonWebsite', () => {
    it('should create a new website', async () => {
      await withTestTransaction(supabase, async (db) => {
        const { testUser, testPerson } = await setupUserAndPerson(db);

        const result = await updatePersonWebsite({
          db,
          personId: testPerson.id,
          data: {
            url: 'https://example.com',
            label: 'Personal'
          }
        });

        expect(result.error).toBeNull();

        const updated = await getPerson({
          db,
          personId: testPerson.id,
          withWebsites: true
        });

        expect(updated.data?.websites).toHaveLength(1);
        expect(updated.data?.websites?.[0]).toMatchObject({
          url: 'https://example.com',
          label: 'Personal'
        });
      });
    });

    it('should update an existing website', async () => {
      await withTestTransaction(supabase, async (db) => {
        const { testUser, testPerson } = await setupUserAndPerson(db);
        // First create a website
        const { data: website } = await db
          .from('websites')
          .insert({
            person_id: testPerson.id,
            user_id: testUser.id,
            url: 'https://old.com',
            label: 'Old'
          })
          .select()
          .single();

        const result = await updatePersonWebsite({
          db,
          personId: testPerson.id,
          websiteId: website.id,
          data: {
            url: 'https://new.com',
            label: 'New'
          }
        });

        expect(result.error).toBeNull();

        const updated = await getPerson({
          db,
          personId: testPerson.id,
          withWebsites: true
        });

        expect(updated.data?.websites).toHaveLength(1);
        expect(updated.data?.websites?.[0]).toMatchObject({
          url: 'https://new.com',
          label: 'New'
        });
      });
    });

    it('should delete a website when _delete is true', async () => {
      await withTestTransaction(supabase, async (db) => {
        const { testUser, testPerson } = await setupUserAndPerson(db);
        // First create a website
        const { data: website } = await db
          .from('websites')
          .insert({
            person_id: testPerson.id,
            user_id: testUser.id,
            url: 'https://delete.com',
            label: 'Delete'
          })
          .select()
          .single();

        const result = await updatePersonWebsite({
          db,
          personId: testPerson.id,
          websiteId: website.id,
          data: {
            _delete: true,
            url: 'https://delete.com',
            label: 'Delete'
          }
        });

        expect(result.error).toBeNull();

        const updated = await getPerson({
          db,
          personId: testPerson.id,
          withWebsites: true
        });

        expect(updated.data?.websites).toHaveLength(0);
      });
    });
  });
});
