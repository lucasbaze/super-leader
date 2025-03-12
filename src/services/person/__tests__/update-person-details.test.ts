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
  updatePersonDetails,
  updatePersonField,
  updatePersonWebsite
} from '../../person/update-person-details';

describe('Person Update Services', () => {
  let supabase: SupabaseClient;

  beforeAll(async () => {
    supabase = await createClient();
  });

  describe('updatePersonField', () => {
    it('should update a single field', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

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

    it('should handle invalid field updates', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

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
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

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
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

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
  });

  describe('updatePersonAddress', () => {
    it('should create a new address', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

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
  });

  describe('updatePersonWebsite', () => {
    it('should create a new website', async () => {
      await withTestTransaction(supabase, async (db) => {
        const testUser = await createTestUser({ db });
        const testPerson = await createTestPerson({
          db,
          data: {
            user_id: testUser.id,
            first_name: 'John',
            last_name: 'Doe'
          }
        });

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
  });

  describe('updatePersonDetails', () => {
    describe('success cases', () => {
      describe('individual field updates', () => {
        it('should update only bio', async () => {
          await withTestTransaction(supabase, async (db) => {
            const testUser = await createTestUser({ db });
            const testPerson = await createTestPerson({
              db,
              data: {
                user_id: testUser.id,
                first_name: 'John',
                last_name: 'Doe',
                bio: 'Original bio'
              }
            });

            const updateData = {
              bio: 'Updated bio',
              contactMethods: [],
              addresses: [],
              websites: []
            };

            await updatePersonDetails({
              db,
              personId: testPerson.id,
              data: updateData
            });

            const result = await getPerson({
              db,
              personId: testPerson.id
            });

            expect(result.data?.person.bio).toBe('Updated bio');
          });
        });

        it('should update only contact methods', async () => {
          await withTestTransaction(supabase, async (db) => {
            const testUser = await createTestUser({ db });
            const testPerson = await createTestPerson({
              db,
              data: {
                user_id: testUser.id,
                first_name: 'John',
                last_name: 'Doe'
              }
            });

            const updateData = {
              bio: '',
              contactMethods: [
                { type: 'email', value: 'test@example.com', is_primary: true },
                { type: 'phone', value: '+1234567890', is_primary: false }
              ],
              addresses: [],
              websites: []
            };

            await updatePersonDetails({
              db,
              personId: testPerson.id,
              data: updateData
            });

            const result = await getPerson({
              db,
              personId: testPerson.id,
              withContactMethods: true
            });

            expect(result.data?.contactMethods).toHaveLength(2);
            expect(result.data?.contactMethods).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  type: 'email',
                  value: 'test@example.com',
                  is_primary: true
                })
              ])
            );
          });
        });

        it('should update only addresses', async () => {
          await withTestTransaction(supabase, async (db) => {
            const testUser = await createTestUser({ db });
            const testPerson = await createTestPerson({
              db,
              data: {
                user_id: testUser.id,
                first_name: 'John',
                last_name: 'Doe'
              }
            });

            const updateData = {
              bio: '',
              contactMethods: [],
              addresses: [
                {
                  street: '123 Test St',
                  city: 'Test City',
                  state: '',
                  postal_code: '12345',
                  country: 'Test Country',
                  label: '',
                  is_primary: true
                }
              ],
              websites: []
            };

            await updatePersonDetails({
              db,
              personId: testPerson.id,
              data: updateData
            });

            const result = await getPerson({
              db,
              personId: testPerson.id,
              withAddresses: true
            });

            expect(result.data?.addresses).toHaveLength(1);
            expect(result.data?.addresses?.[0]).toMatchObject({
              street: '123 Test St',
              city: 'Test City',
              state: '',
              postal_code: '12345',
              country: 'Test Country',
              label: '',
              is_primary: true
            });
          });
        });

        it('should update only websites', async () => {
          await withTestTransaction(supabase, async (db) => {
            const testUser = await createTestUser({ db });
            const testPerson = await createTestPerson({
              db,
              data: {
                user_id: testUser.id,
                first_name: 'John',
                last_name: 'Doe'
              }
            });

            const updateData = {
              bio: '',
              contactMethods: [],
              addresses: [],
              websites: [{ url: 'https://test.com', label: 'Personal Website' }]
            };

            await updatePersonDetails({
              db,
              personId: testPerson.id,
              data: updateData
            });

            const result = await getPerson({
              db,
              personId: testPerson.id,
              withWebsites: true
            });

            expect(result.data?.websites).toHaveLength(1);
            expect(result.data?.websites?.[0]).toMatchObject({
              url: 'https://test.com',
              label: 'Personal Website'
            });
          });
        });
      });

      describe('deletion cases', () => {
        it('should clear bio when empty string is provided', async () => {
          await withTestTransaction(supabase, async (db) => {
            const testUser = await createTestUser({ db });
            const testPerson = await createTestPerson({
              db,
              data: {
                user_id: testUser.id,
                first_name: 'John',
                last_name: 'Doe',
                bio: 'Original bio'
              }
            });

            const updateData = {
              bio: '',
              contactMethods: [],
              addresses: [],
              websites: []
            };

            await updatePersonDetails({
              db,
              personId: testPerson.id,
              data: updateData
            });

            const result = await getPerson({
              db,
              personId: testPerson.id
            });

            expect(result.data?.person.bio).toBe('');
          });
        });

        it('should remove contact methods when empty array is provided', async () => {
          await withTestTransaction(supabase, async (db) => {
            const testUser = await createTestUser({ db });
            const testPerson = await createTestPerson({
              db,
              data: {
                user_id: testUser.id,
                first_name: 'John',
                last_name: 'Doe'
              }
            });

            // First add contact methods
            await updatePersonDetails({
              db,
              personId: testPerson.id,
              data: {
                bio: '',
                contactMethods: [{ type: 'email', value: 'test@example.com', is_primary: true }],
                addresses: [],
                websites: []
              }
            });

            const firstResult = await getPerson({
              db,
              personId: testPerson.id,
              withContactMethods: true
            });

            expect(firstResult.data?.contactMethods).toHaveLength(1);

            // Then remove them
            await updatePersonDetails({
              db,
              personId: testPerson.id,
              data: {
                bio: '',
                contactMethods: [],
                addresses: [],
                websites: []
              }
            });

            const seecondResult = await getPerson({
              db,
              personId: testPerson.id,
              withContactMethods: true
            });

            expect(seecondResult.data?.contactMethods).toHaveLength(0);
          });
        });

        it('should remove addresses when empty array is provided', async () => {
          await withTestTransaction(supabase, async (db) => {
            const testUser = await createTestUser({ db });
            const testPerson = await createTestPerson({
              db,
              data: {
                user_id: testUser.id,
                first_name: 'John',
                last_name: 'Doe'
              }
            });

            // First add address
            await updatePersonDetails({
              db,
              personId: testPerson.id,
              data: {
                bio: '',
                contactMethods: [],
                addresses: [
                  {
                    street: '123 Test St',
                    city: 'Test City',
                    state: '',
                    postal_code: '12345',
                    country: 'Test Country',
                    label: '',
                    is_primary: true
                  }
                ],
                websites: []
              }
            });

            const firstResult = await getPerson({
              db,
              personId: testPerson.id,
              withAddresses: true
            });

            expect(firstResult.data?.addresses).toHaveLength(1);

            // Then remove it
            await updatePersonDetails({
              db,
              personId: testPerson.id,
              data: {
                bio: '',
                contactMethods: [],
                addresses: [],
                websites: []
              }
            });

            const secondResult = await getPerson({
              db,
              personId: testPerson.id,
              withAddresses: true
            });

            expect(secondResult.data?.addresses).toHaveLength(0);
          });
        });

        it('should remove websites when empty array is provided', async () => {
          await withTestTransaction(supabase, async (db) => {
            const testUser = await createTestUser({ db });
            const testPerson = await createTestPerson({
              db,
              data: {
                user_id: testUser.id,
                first_name: 'John',
                last_name: 'Doe'
              }
            });

            // First add website
            await updatePersonDetails({
              db,
              personId: testPerson.id,
              data: {
                bio: '',
                contactMethods: [],
                addresses: [],
                websites: [{ url: 'https://test.com', label: 'Personal Website' }]
              }
            });

            const firstResult = await getPerson({
              db,
              personId: testPerson.id,
              withWebsites: true
            });

            expect(firstResult.data?.websites).toHaveLength(1);

            // Then remove it
            await updatePersonDetails({
              db,
              personId: testPerson.id,
              data: {
                bio: '',
                contactMethods: [],
                addresses: [],
                websites: []
              }
            });

            const secondResult = await getPerson({
              db,
              personId: testPerson.id,
              withWebsites: true
            });

            expect(secondResult.data?.websites).toHaveLength(0);
          });
        });
      });

      describe('isolation tests', () => {
        it('should only update the specified person', async () => {
          await withTestTransaction(supabase, async (db) => {
            const testUser = await createTestUser({ db });

            // Create two people
            const person1 = await createTestPerson({
              db,
              data: {
                user_id: testUser.id,
                first_name: 'John',
                last_name: 'Doe',
                bio: 'Original bio 1'
              }
            });

            const person2 = await createTestPerson({
              db,
              data: {
                user_id: testUser.id,
                first_name: 'Jane',
                last_name: 'Smith',
                bio: 'Original bio 2'
              }
            });

            // Update only person1
            const updateData = {
              bio: 'Updated bio',
              contactMethods: [{ type: 'email', value: 'test@example.com', is_primary: true }],
              addresses: [
                {
                  street: '123 Test St',
                  city: 'Test City',
                  state: '',
                  postal_code: '12345',
                  country: 'Test Country',
                  label: '',
                  is_primary: true
                }
              ],
              websites: [{ url: 'https://test.com', label: 'Personal Website' }]
            };

            await updatePersonDetails({
              db,
              personId: person1.id,
              data: updateData
            });

            // Verify person1 was updated
            const result1 = await getPerson({
              db,
              personId: person1.id,
              withContactMethods: true,
              withAddresses: true,
              withWebsites: true
            });

            expect(result1.data?.person.bio).toBe('Updated bio');
            expect(result1.data?.contactMethods).toHaveLength(1);
            expect(result1.data?.addresses).toHaveLength(1);
            expect(result1.data?.websites).toHaveLength(1);

            // Verify person2 was not affected
            const result2 = await getPerson({
              db,
              personId: person2.id,
              withContactMethods: true,
              withAddresses: true,
              withWebsites: true
            });

            expect(result2.data?.person.bio).toBe('test_Original bio 2');
            expect(result2.data?.contactMethods).toHaveLength(0);
            expect(result2.data?.addresses).toHaveLength(0);
            expect(result2.data?.websites).toHaveLength(0);
          });
        });
      });
    });

    describe('error cases', () => {
      it('should handle database errors gracefully', async () => {
        await withTestTransaction(supabase, async (db) => {
          const result = await updatePersonDetails({
            db,
            personId: 'invalid-uuid-format',
            data: {
              bio: 'test',
              contactMethods: [],
              addresses: [],
              websites: []
            }
          });

          expect(result.error).toMatchObject({
            name: ERRORS.PERSON.UPDATE_ERROR.name,
            type: ERRORS.PERSON.UPDATE_ERROR.type,
            displayMessage: ERRORS.PERSON.UPDATE_ERROR.displayMessage
          });
          expect(result.data).toBeNull();
        });
      });
    });
  });
});
